let Broker = require('./abstract.js');

const kafka = require('kafka-node');

class KafkaNodeBroker extends Broker {
    /**
     * constructor
     * @param {json} connectionConfig
     * @param {string} topic
     */
    constructor(connectionConfig, topic, clientId)  {
        super(connectionConfig, topic, clientId);
    }

    addPublisher() {
        console.log("StreamFusion HLP for Kafka: " + this.topic);
        // initialize kafka producer
        let HighLevelProducer = kafka.HighLevelProducer;
        let client = new kafka.Client(this.config.zookeeper, "producer" + this.clientId);
        this.producer = new HighLevelProducer(client);
    }

    addListener(cb) {
        console.log("Connecting to Kafka: " + this.topic);

        this.Consumer = kafka.Consumer;
        this.client = new kafka.Client(this.config.zookeeper, "consumer" +  this.clientId);
        this.offset = new kafka.Offset(this.client);
        let self = this;
        this.consumer = new this.Consumer(
            this.client,
            [ { topic: this.topic, partition: 0 }],
            { groupId: this.id }
        );

        this.consumer.on('message', function (message) {
            try {
                let rec = JSON.parse(message.value);
                cb(rec);
            } catch (err) {
                console.log("ERROR", err);
            }
        });

        this.consumer.on('error', function (err) {
            console.log("Error", err);
        });

        // If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
        this.consumer.on('offsetOutOfRange', function (topic) {
            console.log(self.id, "outOfRange", topic);
            topic.maxNum = 2;
            self.offset.fetch([topic], function (err, offsets) {
                if (err) {
                    return console.error(err);
                }
                var min = Math.min(offsets[topic.topic][topic.partition]);
                console.log(self);
                self.consumer.setOffset(topic.topic, topic.partition, min);
            });
        });
    }


    publish(msg) {
        this.producer.send([{ topic: this.topic, messages: msg }], function (err, data) {
            console.log("Feature Vector --> Kafka: (err)", err, ", (data)", data);
        });
    }

}

module.exports = KafkaNodeBroker;