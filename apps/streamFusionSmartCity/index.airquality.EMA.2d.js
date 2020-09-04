/**
 * Main stream fusion example for smartmeters (Mlaka).
 */

// includes
const StreamFusion = require('nrg-stream-fusion').streamFusion;

// SMART-CITY CONFIG
let smConf = {
    "aggr": {
        "airquality": [
            { "field": "caqi", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "no2", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "o3", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "pm025", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "pm100", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
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
        "fusionTick": 24 * 60 * 60 * 1000,                              // resampling on 60 min
        "model": {
            topic: "predictions_ST0005-0000",
            horizon: 2,
            label: 0,
            options: {
                method: "EMA",
                N: 5
            }
        },
        "nodes": [
            {
                "type": "airquality",
                "nodeid": "ST0005-0000",
                "aggrConfigId": "airquality",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "caqi|max|86400000" },         // first feature is also the predicted feature
                        { type: "value", "name": "pm100|ma|86400000" },
                        { type: "value", "name": "pm025|ma|86400000" },
                    ]}
                ]
            },
            {
                "type": "weather",
                "nodeid": "W3d",
                "aggrConfigId": "weather",
                "datatype": "daily",
                "datasize": 4,
                "master": false,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "windSpeed2" },                // first feature is also the predicted feature
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
console.log("Initializing models for 2d prediction horizons - simple EMA");
console.log("AirQuality ST0005-0000");

let fusion = [];
const sensors = [ 'caqi|max|86400000', 'no2|max|86400000', 'o3|max|86400000', 'pm025|max|86400000', 'pm100|max|86400000', 'w|ma|86400000'];

// create 10 fusion models
for (let i = 0; i < sensors.length; i++) {
    connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 10);
    smConf["fusion"]["nodes"][0]["attributes"][0]["attributes"][0] = { type: "value", "name": sensors[i] };
    console.log("Sensor:", sensors[i]);
    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //