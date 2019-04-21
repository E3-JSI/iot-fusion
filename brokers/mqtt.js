let Broker = require('./abstract.js');

const mqtt = require('mqtt');

class MQTTBroker extends Broker {
    /**
     * constructor
     * @param {json} connectionConfig
     * @param {string} topic
     */
    constructor(connectionConfig, topic, clientId)  {
        console.log("Constructor MQTT - client id: " + connectionConfig.clientId, clientId);
        super(connectionConfig, topic, clientId);
        this.config.clientId = this.config.clientId + clientId;
        this.client = mqtt.connect(this.config.mqttEndpoint, this.config);
        this.client.on('error', function(err) {
            console.log('MQTT Error', err);
        });
    }

    addPublisher() {
        console.log("StreamFusion MQTT producer: " + this.topic);
        this.publishTopic = this.topic;
        // initialize MQTT producer
        // nothing TO do - client can send messages
    }

    addListener(cb) {
        console.log("StreamFusion MQTT listener: " + this.topic);
        this.client.subscribe(this.topic, { qos: 2 });
        this.client.on('message', function(topic, message) {
            try {
                cb(JSON.parse(message));
                // console.log(JSON.parse(message).time);
            } catch(e) {
                console.log(e);
            }
        });
    }

    publish(msg) {
        console.log("TOPIC: ", this.publishTopic, "MESSAGE: ", msg);
        this.client.publish(this.publishTopic, JSON.stringify(msg));
    }

}

module.exports = MQTTBroker;