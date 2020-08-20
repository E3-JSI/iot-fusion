const { AbstractBroker, KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('../common/brokers/brokers.js');

class SimulatorNode {

    constructor(config, connectionConfig) {
        this.config = config;
        this.startts = 0;
        this.lastts = 0;

        this.holidays = [
            '2020-08-15', '2020-10-31', '2020-11-01', '2020-12-25', '2020-12-26',
            '2021-01-01', '2021-01-02', '2021-02-08', '2021-04-05', '2021-04-27', '2021-05-01', '2021-05-02', '2021-06-25', '2021-08-15', '2021-10-31', '2021-11-01', '2021-12-25', '2021-12-26',
            '2022-01-01', '2022-01-02', '2022-02-08', '2022-04-18', '2022-04-27', '2022-05-01', '2022-05-02', '2022-06-25', '2022-08-15', '2022-10-31', '2022-11-01', '2022-12-25', '2022-12-26'
        ];

        // initialize Kafka
        this.kafkaClientId = Math.random();
        this.topic = "measurements_node_" + config.nodeid;
        this.kafka = new KafkaNodeBroker(connectionConfig, this.topic, this.kafkaClientId);
        this.kafka.addPublisher();
    }

    /**
     * Initialize zero time of the simulator.
     * @param {long} startts Zero time.
     */
    init(startts) {
        // normalize time
        let currentDate = new Date(startts);

        // should we normalize start time
        if (this.config.normalizeStartTime == "second") {
            // get the full second near the current time
            currentDate.setMilliseconds(0);
        } else if (this.config.normalizeStartTime == "minute") {
            // get the full minute near the current timestamp
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        } else if (this.config.normalizeStartTime == "hour") {
            // get the full hour near the current timestamp
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        } else if (this.config.normalizeStartTime == "day") {
            // get the full day near the current timestamp
            currentDate.setHours(0);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        };

        this.startts = currentDate.getTime();
    }

    generateField(field, ts) {
        let val;

        if (field.type == "random") {
            val = Math.random();
        } else if (field.type == "hourOfDay") {
            val = new Date(ts).getHours();
        } else if (field.type == "dayOfWeek") {
            val = new Date(ts).getDay();
        } else if (field.type == "dayAfterHoliday") {
            val = 0;
            let date = new Date(ts - 24 * 3600 * 1000).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (field.type == "dayBeforeHoliday") {
            val = 0;
            let date = new Date(ts + 24 * 3600 * 1000).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (field.type == "dayOfYear") {
            let date = new Date(ts);
            let first = new Date(date.getFullYear(), 0, 1);
            val = Math.round(((date - first) / 1000 / 60 / 60 / 24) + .5, 0);
        } else if (field.type == "dayOfMonth") {
            val = new Date(ts).getDate();
        } else if (field.type == "holiday") {
            val = 0;
            let date = new Date(ts).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (field.type == "monthOfYear") {
            val = new Date(ts).getMonth() + 1;
        } else if (field.type == "weekEnd") {
            val = 0;
            let day = new Date(ts).getDay();
            if (day >= 5) val = 1;
        }

        return val;
    }

    /**
     * Generate the record.
     * @param {long} ts Timestamp in milliseconds.
     */
    generate(ts) {
        // template message from the config
        let msg = this.config.format;
        let tts = 0;

        // are we using prediction horizon?
        if (this.config.horizon !== undefined) {
            ts += this.config.horizon * this.config.frequency;
        }

        // generate time
        if (this.config.timeFormat === "unixms") {
            tts = ts;
        } else if (this.config.timeFormat === "unixs") {
            tts = Math.floor(ts / 1000);
        }
        msg = msg.replace("%time%", tts);

        // generate fields
        let fields = {};
        for (let field of this.config.fields) {
            fields[field.name] = this.generateField(field, ts);
        }

        if (this.config.parts !== undefined) {
            fields["parts"] = this.generateParts(ts);
        }

        for (let field of this.config.fields) {
            msg = msg.replace("%" + field.name + "%", fields[field.name]);
        }

        return msg;
    }

    /**
     * Generate parts of the record for weatherforecast.
     * @param {long} ts Timestamp in milliseconds.
     */
    generateParts(ts) {
        let msg = "";
        for (let i = 0; i < this.config.parts; i++) {
            let fMsg = this.config.formatPart;

            for (let field of this.config.fields) {
               fMsg = fMsg.replace("%" + field.name + "%", this.generateField(field, ts));
            }

            if (msg !== "") msg += ",";
            msg += fMsg;

        }

        return msg;
    }

    /**
     * Sending the new record.
     */
    send() {
        this.lastts += this.config.frequency;
        const record = this.generate(this.lastts + this.startts);
        console.log("Sending record: " + this.topic);
        this.kafka.publish(JSON.stringify(record));
    }

    /**
     * Check if sending of new data is needed.
     * @param {long} relative Relative timestamp from the start of the simulation.
     * @param {long} startts Start timestamp.
     */
    check(relative) {
        // if we are exceeding double time of the node, then the
        // simulator is not able to keep up with the speed of the
        // stream
        if ((relative - this.lastts) > 2 * this.config.frequency) {
            throw new Error("double time exceeded" + this.config);
        }

        if ((relative - this.lastts) > this.config.frequency) {
            this.send();
        }
    }

}

module.exports = SimulatorNode;