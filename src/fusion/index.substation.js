/**
 * Main stream fusion example for smartmeters (In2Dreams).
 */

// includes
const StreamFusion = require('./streamFusion.js');

// SUBSTATION CONFIG
let smConf = {
    "aggr": {
        "substation": [
            { "field": "power", "tick": [
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [          // 1h sliding window
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "current", "tick": [
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [          // 1h sliding window
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "voltage", "tick": [
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [          // 1h sliding window
                    {"type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]},
                { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w sliding window
                    { "type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
        ],
        "static": [
            { "field": "holiday", "tick": [
                { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [
                    { "type": "ma" }
                ]}
            ]}
        ]
    },
    "fusion": {                                                         // feature vector configuration
        "fusionModel": "N1_24h",                                        // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "nodes": [
            {
                "type": "substation",
                "nodeid": "N1",
                "aggrConfigId": "substation",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "voltage|ma|3600000" },
                        { type: "value", "name": "power|ma|21600000" },
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "voltage|ma|21600000" },
                        { type: "value", "name": "power|ma|86400000" },
                        { type: "value", "name": "current|ma|86400000" },
                        { type: "value", "name": "voltage|ma|86400000" },

                        { type: "value", "name": "power|ma|21600000" },
                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "voltage|min|21600000" },
                        { type: "value", "name": "power|min|86400000" },
                        { type: "value", "name": "current|min|86400000" },
                        { type: "value", "name": "voltage|min|86400000" },

                        { type: "value", "name": "power|max|21600000" },
                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "voltage|max|21600000" },
                        { type: "value", "name": "power|ma|86400000" },
                        { type: "value", "name": "current|max|86400000" },
                        { type: "value", "name": "voltage|max|86400000" },

                        { type: "value", "name": "power|variance|21600000" },
                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "voltage|variance|21600000" },
                        { type: "value", "name": "power|variance|86400000" },
                        { type: "value", "name": "current|variance|86400000" },
                        { type: "value", "name": "voltage|variance|86400000" },

                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                        { type: "value", "name": "voltage|ma|3600000" }
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                        { type: "value", "name": "voltage|ma|3600000" }
                    ]},
                    { "time": -7 * 24, "attributes": [                      // 1w ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                        { type: "value", "name": "voltage|ma|3600000" }
                    ]}
                ]
            },
            {
                "type": "substation",
                "nodeid": "N2",
                "aggrConfigId": "substation",
                "master": false,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "power|ma|21600000" },
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "power|ma|86400000" },
                        { type: "value", "name": "current|ma|86400000" },

                        { type: "value", "name": "power|min|21600000" },
                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "power|min|86400000" },
                        { type: "value", "name": "current|min|86400000" },

                        { type: "value", "name": "power|max|21600000" },
                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "power|max|86400000" },
                        { type: "value", "name": "current|max|86400000" },

                        { type: "value", "name": "power|variance|21600000" },
                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "power|variance|86400000" },
                        { type: "value", "name": "current|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -7 * 24, "attributes": [                      // 1w ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]}
                ]
            },
            {
                "type": "substation",
                "nodeid": "N3",
                "aggrConfigId": "substation",
                "master": false,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "power|ma|21600000" },
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "power|ma|86400000" },
                        { type: "value", "name": "current|ma|86400000" },

                        { type: "value", "name": "power|min|21600000" },
                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "power|min|86400000" },
                        { type: "value", "name": "current|min|86400000" },

                        { type: "value", "name": "power|max|21600000" },
                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "power|max|86400000" },
                        { type: "value", "name": "current|max|86400000" },

                        { type: "value", "name": "power|variance|21600000" },
                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "power|variance|86400000" },
                        { type: "value", "name": "current|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -7 * 24, "attributes": [                          // 1w ago
                        { type: "value", "name": "power|ma|3600000" },
                        { type: "value", "name": "current|ma|3600000" },
                    ]}
                ]
            },
            {
                "type": "static",
                "nodeid": "S1",
                "aggrConfigId": "static",
                "master": false,
                "attributes": [
                    { "time": 24, "attributes": [
                        { type: "value", "name": "timeOfDay" },
                        { type: "value", "name": "weekEnd" },
                        { type: "value", "name": "holiday" },
                        { type: "value", "name": "dayAfterHoliday" },
                        { type: "value", "name": "dayBeforeHoliday" },
                        { type: "value", "name": "dayOfWeek" },
                        { type: "value", "name": "dayOfYear" },
                        { type: "value", "name": "monthOfYear" }
                    ]}
                ]
            }
        ]
    }
};


// Kafka connection Config
// connectionConfig
// let connectionConfig = {
//     kafka: "localhost:9092",
//     zookeeper: "localhost:2181",
//}

let connectionConfig = {
    kafka: "192.168.99.100:9092",
    zookeeper: "192.168.99.100:2181",
}

// // MQTT connection config
// let connectionConfig = {
//     port: 1883,
//     mqttEndpoint: 'mqtt://192.168.99.101:1883',
//     clientId: 'clientTrain_' + Math.random().toString(16).substr(2, 8),
//     username: 'mqtt-in2',
//     password: 'mqtt-in2'
// }

// initialize all the fusion scenarios
let fusion = [];

// set start and end from commandline
let start = 0;
let end = 0;


// set start and end from commandline
if (process.argv[2] != "") start = parseInt(process.argv[2]);
if (process.argv[3] != "") end = parseInt(process.argv[3]);

let horizons =  [1, 4, 12, 24];


// create 10 fusion models
for (let i = start; i <= end; i++) {
    connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 8);

    // change weather feature according to time horizon
    let horizon = horizons[i];
    /*
    // handling changable weather features
    let features = ['temperature', 'humidity', 'pressure', 'windSpeed', 'windBearing', 'cloudCover' ];
    let attributes = [];

    for (let i in features) {
        let featureName = features[i] + horizon;
        attributes.push({type: "value", name: featureName});
    }
    smConf["fusion"]["nodes"][2]["attributes"]["attributes"] = attributes;
    */
    smConf["fusion"]["nodes"][3]["attributes"][0]["time"] = horizon;
    smConf["fusion"]["fusionModel"] = "N1_" + horizon + "h";

    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //
