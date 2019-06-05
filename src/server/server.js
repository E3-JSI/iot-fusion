// includes
const { AbstractBroker, KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('../common/brokers/brokers.js');
const Utils = require('../common/utils/utils.js');

class server {
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
        // determine whether command is relevant for current client
        // by default it is (if intended for all slaves)
        let target = true;
        // if intended for a particular slave, it should be a match
        if ("target" in msg) {
            if (msg["target"] != this.client_id) target = false;
        };

        if (target == false) return;

        if ("command" in msg) {
            if (msg.command == "identify") {
                this.broker.publish(this.composeMessage({}));
            }
            else if (msg.command == "status") {
                // TODO: report on status
                // build a list of fusions
            }
            else if (msg.command == "new") {
                // TODO: spawn a new fusion
            }
            else if (msg.command == "delete") {
                // TODO: destroy and delete a fusion model
            }
        }
        console.log("Received:", msg);
    }
}

// expose class to the outside world
module.exports = server;