// kafka-node integration debug/test

// kafka
const { KafkaNodeBroker } = require('../brokers/brokers.js');

// configuration
let connectionConfig = {
    kafka: "172.29.12.94:9092",
}
let fusion_id = "xyz-" + Math.random();
let topic = "measurements_node_ST0005-0001";


// process record function definition
function processRecord(rec) {
    console.log(rec);
}



// main program
broker = new KafkaNodeBroker(connectionConfig, topic, fusion_id);
broker.addListener(processRecord);
