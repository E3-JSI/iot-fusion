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
        "calculated": []
    },
    "fusion": {                                                         // feature vector configuration
        "fusionModel": "ST0005-0000_3h",                                // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "model": {
            topic: "predictions_ST0005-0000",
            horizon: 12,
            label: 0,
            options: {
                method: "StructuredEMA",
                structuralFactorPosition: 3,
                N: 5
            }
        },
        "nodes": [
            {
                "type": "smartlamp",
                "nodeid": "ST0005-0000",
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
                "type": "calculated",
                "nodeid": "calculated",
                "aggrConfigId": "calculated",
                "nodeFrequency": 3600000,
                "fusionTick": 3600000,  // debug this - this is set via streamingNode or similar
                "master": false,
                "holidays": [
                    '2020-08-15', '2020-10-31', '2020-11-01', '2020-12-25', '2020-12-26',
                    '2021-01-01', '2021-01-02', '2021-02-08', '2021-04-05', '2021-04-27', '2021-05-01', '2021-05-02', '2021-06-25', '2021-08-15', '2021-10-31', '2021-11-01', '2021-12-25', '2021-12-26',
                    '2022-01-01', '2022-01-02', '2022-02-08', '2022-04-18', '2022-04-27', '2022-05-01', '2022-05-02', '2022-06-25', '2022-08-15', '2022-10-31', '2022-11-01', '2022-12-25', '2022-12-26'
                ],
                "attributes": [
                    { "time": 12, "attributes": [
                        { type: "value", name: "hourOfDay" }
                    ]}
                ]
            }
        ]
    }
};

// kafka connection config
let connectionConfig = {
    kafka: "172.29.12.94:9092",
}

// initialize all the fusion scenarios
console.log("Initializing models for 3h prediction horizons - simple EMA");
console.log("ST0005-0000 to ST00005-0028");

let fusion = [];

function lZ(i) {
    if (i < 10) return "0" + i;
    return i;
}

// create 10 fusion models
for (let i = 0; i <= 28; i++) {
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
    smConf["fusion"]["fusionModel"] = nodeId + "_12h";
    smConf["fusion"]["model"]["topic"] = "predictions_" + nodeId;

    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //