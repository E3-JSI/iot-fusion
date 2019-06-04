/**
 * streamMaster
 * Class for orchestration/organization of stream fusion models.
 */

// includes
const { AbstractBroker, KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('./brokers/brokers.js');
const streamFusion = require('./streamFusion.js');

class streamMaster {
    /**
     * Constructor for the stream fusion master.
     * @param {JSON} config Configuration structure for the master.
     */
    constructor(config) {
        // scope
        let self = this;

        // remember config
        this.config = JSON.parse(JSON.stringify(config));
        // initialize an empty list of fusions
        this.fusion = [];
        // admin topic
        this.topic = "fusionAdmin";
        this.client_id = (Math.random() * 1000000000).toString();

        // connect to broker
        if ("connection" in config) {
            if (config["connection"].type == "kafka") {
                this.broker = new KafkaNodeBroker(this.config["connection"].options, this.topic, this.client_id);
                this.broker.addPublisher();
                this.broker.addListener(self.messageCb.bind(self));
            } else if (config["connection"].type == "mqtt") {
                this.broker = new MQTTBroker(this.config["connection"].options, this.topic, this.client_id);
                this.broker.addPublisher();
                this.broker.addListener(self.messageCb.bind(self));
            } else {
                // fake broker
                this.broker = new AbstractBroker(this.config["connection"].options, this.topic, this.client_id);
            }
        }
    }

    /**
     * Receive message via broker's admin topic.
     * @param {string} msg
     */
    messageCb(msg) {
        console.log(this);
        if ("command" in msg) {
            if (msg.command == "identify") {
                this.broker.publish(JSON.stringify({"client_id": this.client_id }));
            }
        }
        console.log("Received:", msg);
    }
}

// expose class to the outside world
module.exports = streamMaster;