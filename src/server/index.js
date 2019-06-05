const Server = require('./server.js');

const config = {
    "connection": {
        type: "kafka",
        options: {
            kafka: "192.168.99.100:9092",
            zookeeper: "192.168.99.100:2181"
        }
    }
}

const streamMaster = new Server(config);