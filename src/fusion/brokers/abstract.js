/**
 * Abastract broker class.
 * The class can be extended with different Kafka libraries (kafka-node, node-rdkafka),
 * MQTT libraries, node streams, etc.
 */

class Broker {
    /**
     * constructor
     * @param {json} connectionConfig
     * @param {string} topic
     */
    constructor(connectionConfig, topic, clientId) {
        this.topic = topic;
        this.config = connectionConfig;
        this.clientid = clientId;
    }

    /**
     * addPublisher
     */
    addPublisher() {
        // when event happens on broker, add callback
        // on('data) { cb(data) }
    }

    /**
     * addListener
     * Adds a callback to the on('data') event of a specific broker.
     * @param {function} cb
     */
    addListener(cb) {
        // when event happens on broker, add callback
        // on('data) { cb(data) }
    }

    /**
     * publish
     * Publishes data on a seleted topic on a broker.
     */
    publish() {
        // publish data
        // producer.publish(topic, message)
    }
}

module.exports = Broker;