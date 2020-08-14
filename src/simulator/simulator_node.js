class SimulatorNode {

    constructor(config, startts) {
        this.config = config;
        this.startts = 0;
        this.lastts = 0;
    }

    /**
     * Initialize zero time of the simulator.
     * @param {long} startts Zero time.
     */
    init(startts) {
        this.startts = startts;
    }

    /**
     * Generate the record.
     * @param {long} ts Timestamp in milliseconds.
     */
    generate(ts) {
        // template message from the config
        let msg = this.config.format;
        let tts = 0;

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
            if (field.type == "random") {
                fields[field.name] = Math.random();
            }
        }

        for (let field of this.config.fields) {
            msg = msg.replace("%" + field.name + "%", fields[field.name]);
        }

        return msg;
    }

    /**
     * Sending the new record.
     */
    send() {
        this.lastts += this.config.frequency;
        const record = this.generate(this.lastts + this.startts);
        console.log("Sending record: " + record);
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