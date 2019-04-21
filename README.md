# IoT-fusion component

## Requirements
You need to have ```node.js``` installed (tested with node 8.6.1+) and ```npm```.
You need to have Kafka installed (cloud setup) or MQTT (edge setup) in your system and appropriate topics for receiving raw data from sensor nodes and sending feature vectors set up.

## Installation
Clone the repository into your working directory and run installation procedure simply with ```npm install```.

## Configurations
You need to configure separately your aggregate configurations (see example below) and fusion configurations. Some of the configurations can be observed in ```conf/``` folder.

```javascript
let aggrConfigs = {
    "energy": [
        { "field": "pc", "tick": [
            { "type": "winbuf", "winsize": 1 * 60 * 60 * 1000, "sub": [
                { "type": "variance" },
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" }
            ]},
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [
                { "type": "variance" },
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" }
            ]}
        ]}
    ],
    "weather": [],
    "static": []
};
```
Each fusion model is defined separately with the following config. It needs to have an id (lowercase characters; they need to comply with the system guidelines for directory names).

Each fusion model is built up from an array of nodes (they can be either smart meter nodes, weather nodes or static data nodes). Each node must have a nodeid (defines the channel on kafka, where data is received), it must point to an appropriate streamaggregate configuration (in the previous structure) and it consists of an array of attributes.

Each attribute family is defined with a time defined in hours (0 = current timestamp; -24 stands for features from 24 hours ago). Each attribute must contain type of the value ("value", ... TODO) and the name of the attribue, which consists of sensorName|streamAggregateType|timeWindowInMs.

```javascript
let fusionConfig = {
    "fusionModel": "test",
    "nodes": [
        {
            "nodeid": "TPRazdrtovas7484C475A66710C690C",
            "aggrConfigId": "energy",
            "attributes": [
                { "time": 0, "attributes": [
                    { type: "value", "name": "pc|ma|3600000" }
                ]}
            ]
        }
    ]
}
```

## Running
Run simply with ```npm start```.

# Publication

Please refer to this paper (currently under consideration in MDPI Sensors):

* Kenda, K.; Kažič, B.; Novak, E.; Mladenić, D. Streaming Data Fuson for the Internet of Things. Sensors 2019 (in review)
