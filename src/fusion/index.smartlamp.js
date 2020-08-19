/**
 * Main stream fusion example for smartmeters (In2Dreams).
 */

// includes
const StreamFusion = require('./streamFusion.js');

// SUBSTATION CONFIG
let smConf = {
    "aggr": {
        "smartlamp": [
            { "field": "pact", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "dimml", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
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
        "fusionModel": "ST0005-0001_3h",                                // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "model": {
            horizon: 3,
            label: 0,
            options: {
                structuralFactorPosition: 3,
            },
            method: "StructuredEMA"
        },
        "nodes": [
            {
                "type": "smartlamp",
                "nodeid": "ST0005-0001",
                "aggrConfigId": "smartlamp",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "pact" },                      // first feature is also the predicted feature
                        { type: "value", "name": "pact|ma|86400000" },
                        { type: "value", "name": "dimml|ma|86400000" },
                    ]}
                ]
            },
            {
                "type": "static",
                "nodeid": "S1",
                "aggrConfigId": "static",
                "master": false,
                "attributes": [
                    { "time": 3, "attributes": [
                        { type: "value", "name": "timeOfDay" },
                        { type: "value", "name": "dayOfWeek" },
                        { type: "value", "name": "dayOfYear" }
                    ]}
                ]
            }
        ]
    }
};

// kafka connection config
let connectionConfig = {
    kafka: "localhost:9092",
}

const fusion = new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]);

/*
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
    */
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
    /*
    smConf["fusion"]["nodes"][3]["attributes"][0]["time"] = horizon;
    smConf["fusion"]["fusionModel"] = "N1_" + horizon + "h";

    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //
*/