/**
 * Stream fusion component for substations (In2Dreams).
 */

// AZOT CONFIG
let smConf = {
    "aggr": {
        "timevalue": [
            { "field": "value", "tick": [
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [         // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 1d sliding window
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
            ]}
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
                "type": "timevalue",
                "nodeid": "N1",
                "aggrConfigId": "timevalue",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "value" },                     // first feature is also the predicted feature

                        { type: "value", "name": "value|ma|21600000" },         // 6h aggregate
                        { type: "value", "name": "value|min|21600000" },
                        { type: "value", "name": "value|max|21600000" },
                        { type: "value", "name": "value|variance|21600000" },

                        { type: "value", "name": "value|ma|86400000" },         // 1d aggregate
                        { type: "value", "name": "value|min|86400000" },
                        { type: "value", "name": "value|max|86400000" },
                        { type: "value", "name": "value|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -7 * 24, "attributes": [                          // 1w ago
                        { type: "value", "name": "value" }
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

// connectionConfig
let connectionConfig = {
    kafka: "192.168.99.100:9092",
    zookeeper: "192.168.99.100:2181",
}

let horizons = [12, 24, 36];

// END OF CONFIGURATION STRUCTURES ----------------------------------------------

// includes
const StreamFusion = require("nrg-stream-fusion").streamFusion;

// initialize all the fusion scenarios
let fusion = [];

// set start and end from commandline
let start = 0;
let end = 0;

// set start and end from commandline
if (process.argv[2] != "") start = parseInt(process.argv[2]);
if (process.argv[3] != "") end = parseInt(process.argv[3]);

// create (end - start) models for different horizons
for (let i = start; i <= end; i++) {
    connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 8);

    // change weather feature according to time horizon
    let horizon = horizons[i];

    // shifting DT features
    smConf["fusion"]["nodes"][1]["attributes"][0]["time"] = horizon;

    // renaming model
    smConf["fusion"]["fusionModel"] = "N1_" + horizon + "h";

    // adding fusion model
    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
}
