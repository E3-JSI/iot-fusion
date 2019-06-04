/**
 * streamMaster
 * Class for orchestration/organization of stream fusion models.
 */

// includes
const { AbstractBroker, KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('./brokers/brokers.js');
const streamFusion = require('./streamFusion.js');
const Utils = require('./utils/utils.js');

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
        // set version
        this.version = "1.0.0";
        // set client id (= master_id)
        this.client_id = Utils.uuidv4();

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
     * Packs the message in the standard format.
     * @param {*} msg
     * @return Returns string with the message msg with added standard headers.
     */
    composeMessage(msg) {
        // initialize the message
        let message = msg;
        // add standard headers
        message["id"] = this.client_id;
        message["version"] = this.version;

        // return the message
        return JSON.stringify(message);
    }

    /**
     * Receive message via broker's admin topic.
     * @param {JSON} msg Message from broker.
     */
    messageCb(msg) {
        if ("command" in msg) {
            if (msg.command == "identify") {
                this.broker.publish(this.composeMessage({}));
            }
        }
        console.log("Received:", msg);
    }
}

// expose class to the outside world
module.exports = streamMaster;