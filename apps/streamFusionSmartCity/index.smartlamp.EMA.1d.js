/**
 * Main stream fusion example for smartmeters (Mlaka).
 */

// includes
const StreamFusion = require('nrg-stream-fusion').streamFusion;

// SMART-CITY CONFIG
let smConf = {
    "aggr": {
        "smartlamp": [
            { "field": "pact", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 24h sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 7d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]}
        ],
        "weather": []
    },
    "fusion": {                                                         // feature vector configuration
        "fusionModel": "ST0005-0000_1d",                                // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 24 * 60 * 60 * 1000,                              // resampling on 24h
        "model": {
            topic: "predictions_ST0005-0000",
            horizon: 3,
            label: 0,
            options: {
                method: "EMA",
                N: 5
            }
        },
        "nodes": [
            {
                "type": "smartlamp",
                "nodeid": "ST0005-0001",
                "aggrConfigId": "smartlamp",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "pact|ma|86400000" },          // first feature is also the predicted feature
                        { type: "value", "name": "pact|ma|604800000" },
                        { type: "value", "name": "dimml|ma|604800000" },
                    ]}
                ]
            },
            {
                "type": "weather",
                "nodeid": "W3d",
                "aggrConfigId": "weather",
                "master": false,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "windSpeed3" },                // first feature is also the predicted feature
                    }
                ]
            }
        ]
    }
};

// kafka connection config
let connectionConfig = {
    // kafka: "172.29.12.94:9092",
    kafka: "localhost:9092",
}

// initialize all the fusion scenarios
console.log("Initializing models for 1d prediction horizons - simple EMA");
console.log("ST0005-0000 to ST00005-0028");

let fusion = [];

function lZ(i) {
    if (i < 10) return "0" + i;
    return i;
}

// create 10 fusion models
for (let i = 1; i <= 1; i++) {
    connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 8);

    /*
    // change weather feature according to time horizon
    let horizon = horizons[i];

    // handling changable weather features
    let features = ['temperature', 'humidity', 'pressure', 'windSpeed', 'windBearing', 'cloudCover' ];
    let attributes = [];

    for (let i in features) {
        let featureName = features[i] + horizon;
        attributes.push({type: "value", name: featureName});
    }
    smConf["fusion"]["nodes"][2]["attributes"]["attributes"] = attributes;
    */

    nodeId = "ST0005-00" + lZ(i);
    smConf["fusion"]["nodes"][0]["nodeid"] = nodeId;
    smConf["fusion"]["fusionModel"] = nodeId + "_1d";
    smConf["fusion"]["model"]["topic"] = "predictions_" + nodeId;

    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //