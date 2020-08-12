# Users' Manual

Manual is still under construction. Please check unit tests and apps folder for illustarations of configuration files and usage.

Exceptions are mentioned below.

## Installation

Install NPM package with: `npm install nrg-stream-fusion`.

## Usage
This example connects to two Kafka topics (`measurements_node_N1` and `measurements_node_W1`), which emit data streams from IoT (`N1`) and weather forecast (`W1`).

```js
// load stream fusion component
const StreamFusion = require("nrg-stream-fusion").streamFusion;

// create simple fusion config
const config = {
    "aggr": {
        "iot": [
            { "field": "value", "tick": [
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]}
            ]}
        ]
    },
    "fusion": {
        "fusionModel": "N1_24h", // also name of the output Kafka topic; intended for predictions with 24h prediction horizon
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,
        "nodes": [
            {
                "type": "timevalue", // type of the node (timevalue, weather, static ...)
                "nodeid": "N1", // input topic measurements_node_N1
                "aggrConfigId": "iot",
                "master": true, // this is master node
                "attributes": [
                    {
                        "time": 0, // for prediction time
                        "attributes": [
                            { "type": "value", "name": "value" },
                            // current value from iot
                            { "type": "value|ma|21600000" },
                            // moving average for 6h time window
                            { "type": "value|variance|21600000" },
                            // moving variance for 6h time window
                            { "type": "value|max|21600000" },
                            // moving maximum for 6h time window
                        ]
                    },
                    {
                        "time": -24, // feature values from 24h ago
                        "attributes": [
                            { type: "value", "name": "value|ma|21600000" },
                            // 6h moving average for 24h ago
                            { type: "value", "name": "value|variance|21600000" }
                            // 6h moving variance for 24h ago
                        ]
                    }
                ]
            },
            {
                "type": "weather", // type of the node (timevalue, weather, static ...)
                "nodeid": "W1", // input topic measurements_node_W1
                "aggrConfigId": "weather",
                "master": false, // this is slave node
                "attributes": [
                    {
                        "time": 0, // for prediction time
                        "attributes": [
                            { "type": "value", "name": "temperature24" },
                            // current weather prediction for 24h ahead
                            { "type": "value", "name": "humidity24" }
                        ]
                    }
                ]
            }
        ]
    }
}

// define configuration for connecting to Kafka
// zookeeper data is obsolete
const connectionConfig = {
    kafka: "192.168.99.100:9092",
    zookeeper: "192.168.99.100:2181",
}

// create fusion object, that listens to the topics for iot and weather data and outputs feature vectors for modeling on another topic
const fusion = new StreamFusion(connectionConfig, config["fusion"], config["aggr"]);
```

## streamingWeatherNode

Streaming weather node accepts data in the DarkSky format. It is the only one, that is configurable at the moment.

Node config can include the following properties:

* `datasize`: number of records in the JSON array (default: 48)
* `datatype`: could be set either to `"hourly"` or `"daily"`
* `fieldTypes`: includes the field names in the data records; default are `["temperature", "humidity", "pressure", "windSpeed", "windBearing", "cloudCover"]`