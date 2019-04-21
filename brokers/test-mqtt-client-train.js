let MQTTBroker = require('./brokers.js').MQTTBroker;

let connectionConfig = {
    port: 1883,
    mqttEndpoint: 'mqtt://192.168.99.100:1883',
    clientId: 'clientTrain',
    username: 'mqtt-in2',
    password: 'mqtt-in2'
}


this.broker = new MQTTBroker(connectionConfig,
    "measurements_node_train",
    "client_client_xxy");

this.broker.addListener(display);

function display(msg) {
    for (let i = 1; i < 1000; i++) {
        console.log(msg);
    }
}