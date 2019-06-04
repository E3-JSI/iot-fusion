const StreamMaster = require('./streamMaster.js');

const config = {
    "connection": {
        type: "kafka",
        options: {
            kafka: "192.168.99.100:9092",
            zookeeper: "192.168.99.100:2181"
        }
    }
}

const streamMaster = new StreamMaster(config);