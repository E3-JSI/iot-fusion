// BEGINNING OF CONFIGURATION STRUCTURES -------------------------------------------

// horizons are defined with seconds
let horizons =  [1, 5, 10, 20, 60];

const smConf = {
    "aggr": {
        "train": [
            { "field": "icat", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [              // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [              // 1m
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [         // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [         // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [         // 1h
                    { "type": "ma" }
                ]}
            ]},

            { "field": "ucat", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [              // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [              // 1m
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [         // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [         // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [         // 1h
                    { "type": "ma" }
                ]}
            ]},

            { "field": "itcu1", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [              // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [              // 1min
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [         // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [         // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [         // 1h
                    { "type": "ma" }
                ]}
            ]},

            { "field": "itcu2", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [              // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [              // 1min
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [         // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [         // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [         // 1h
                    { "type": "ma" }
                ]}
            ]},

            { "field": "icsv", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [              // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [              // 1min
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [         // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [         // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [         // 1h
                    { "type": "ma" }
                ]}
            ]},

            { "field": "speed", "tick": [
                { "type": "winbuf", "winsize": 5 * 1000, "sub": [               // 5s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [              // 10s
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [                // 30s
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [                // 1m
                    {"type": "ma" },
                    {"type": "min" },
                    {"type": "max" },
                    {"type": "variance" }
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [           // 10m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 30 * 60 * 1000, "sub": [           // 30m
                    { "type": "ma" }
                ]},
                { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [           // 1h
                    { "type": "ma" }
                ]}
            ]},

        ]
    },

    "fusion": {
        "fusionModel": "train",
        "model": {
            horizon: 10,
            label: 0,
            dim:  null,
            options: {},
            method: "RecLinReg",                                                // LinReg algorithm
            topic: "predictions_train"
        },
        "connection": {
            "type": "mqtt"
        },
        // Feature vector schema definition
        "fusionTick": 1000,
        "nodes": [
            {
                "type": "train",
                "nodeid": "train",
                "aggrConfigId": "train",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current time
                        { type: "value", "name": "icat" },
                        { type: "value", "name": "ucat" },
                        { type: "value", "name": "itcu1" },
                        { type: "value", "name": "itcu2" },
                        { type: "value", "name": "icsv" },
                        { type: "value", "name": "speed" },
                        { type: "value", "name": "lat" },
                        { type: "value", "name": "long" }
                    ]},
                    { "time": -5, "attributes": [                        // 5s ago
                        { type: "value", "name": "icat|ma|5000" },
                        { type: "value", "name": "ucat|ma|5000" },
                        { type: "value", "name": "itcu1|ma|5000" },
                        { type: "value", "name": "itcu2|ma|5000" },
                        { type: "value", "name": "icsv|ma|5000" },
                        { type: "value", "name": "speed|ma|5000" }
                    ]},
                    { "time": -10, "attributes": [                       // 10s ago
                        { type: "value", "name": "icat|ma|10000" },
                        { type: "value", "name": "icat|max|10000" },
                        { type: "value", "name": "icat|min|10000" },
                        { type: "value", "name": "icat|variance|10000" },
                        { type: "value", "name": "ucat|ma|10000" },
                        { type: "value", "name": "ucat|max|10000" },
                        { type: "value", "name": "ucat|min|10000" },
                        { type: "value", "name": "ucat|variance|10000" },
                        { type: "value", "name": "itcu1|ma|10000" },
                        { type: "value", "name": "itcu1|max|10000" },
                        { type: "value", "name": "itcu1|min|10000" },
                        { type: "value", "name": "itcu1|variance|10000" },
                        { type: "value", "name": "itcu2|ma|10000" },
                        { type: "value", "name": "itcu2|max|10000" },
                        { type: "value", "name": "itcu2|min|10000" },
                        { type: "value", "name": "itcu2|variance|10000" },
                        { type: "value", "name": "ucat|ma|10000" },
                        { type: "value", "name": "ucat|max|10000" },
                        { type: "value", "name": "ucat|min|10000" },
                        { type: "value", "name": "ucat|variance|10000" },
                        { type: "value", "name": "speed|ma|10000" },
                        { type: "value", "name": "speed|max|10000" },
                        { type: "value", "name": "speed|min|10000" },
                        { type: "value", "name": "speed|variance|10000" }
                    ]},
                    { "time": -30, "attributes": [                       // 30s ago
                        { type: "value", "name": "icat|ma|30000" },
                        { type: "value", "name": "ucat|ma|30000" },
                        { type: "value", "name": "itcu1|ma|30000" },
                        { type: "value", "name": "itcu2|ma|30000" },
                        { type: "value", "name": "icsv|ma|30000" },
                        { type: "value", "name": "speed|ma|30000" }
                    ]},
                    { "time": -60, "attributes": [                       // 1min ago
                        { type: "value", "name": "icat|ma|60000" },
                        { type: "value", "name": "icat|max|60000" },
                        { type: "value", "name": "icat|min|60000" },
                        { type: "value", "name": "icat|variance|60000" },
                        { type: "value", "name": "ucat|ma|60000" },
                        { type: "value", "name": "ucat|max|60000" },
                        { type: "value", "name": "ucat|min|60000" },
                        { type: "value", "name": "ucat|variance|60000" },
                        { type: "value", "name": "itcu1|ma|60000" },
                        { type: "value", "name": "itcu1|max|60000" },
                        { type: "value", "name": "itcu1|min|60000" },
                        { type: "value", "name": "itcu1|variance|60000" },
                        { type: "value", "name": "itcu2|ma|60000" },
                        { type: "value", "name": "itcu2|max|60000" },
                        { type: "value", "name": "itcu2|min|60000" },
                        { type: "value", "name": "itcu2|variance|60000" },
                        { type: "value", "name": "ucat|ma|60000" },
                        { type: "value", "name": "ucat|max|60000" },
                        { type: "value", "name": "ucat|min|60000" },
                        { type: "value", "name": "ucat|variance|60000" },
                        { type: "value", "name": "speed|ma|60000" },
                        { type: "value", "name": "speed|max|60000" },
                        { type: "value", "name": "speed|min|60000" },
                        { type: "value", "name": "speed|variance|60000" }
                    ]}
                    /*
                    ,
                    { "time": -10 * 60, "attributes": [                 // 10min ago
                        { type: "value", "name": "icat|ma|60000" },
                        { type: "value", "name": "ucat|ma|60000" },
                        { type: "value", "name": "itcu1|ma|60000" },
                        { type: "value", "name": "itcu2|ma|60000" },
                        { type: "value", "name": "icsv|ma|60000" },
                        { type: "value", "name": "speed|ma|60000" }
                    ]},
                    { "time": -30 * 60, "attributes": [                  // 30min ago
                        { type: "value", "name": "icat|ma|180000" },
                        { type: "value", "name": "ucat|ma|180000" },
                        { type: "value", "name": "itcu1|ma|180000" },
                        { type: "value", "name": "itcu2|ma|180000" },
                        { type: "value", "name": "icsv|ma|180000" },
                        { type: "value", "name": "speed|ma|180000" }
                    ]},
                    { "time": -60 * 60, "attributes": [                 // 1h ago
                        { type: "value", "name": "icat|ma|3600000" },
                        { type: "value", "name": "ucat|ma|360000" },
                        { type: "value", "name": "itcu1|ma|360000" },
                        { type: "value", "name": "itcu2|ma|360000" },
                        { type: "value", "name": "icsv|ma|360000" },
                        { type: "value", "name": "speed|ma|360000" }
                    ]}
                    */
                ]
            }
        ]
    }
};

// MQTT connection config
let connectionConfig = {
    port: 1883,
    mqttEndpoint: 'mqtt://192.168.99.100:1883',
    clientId: 'clientTrain_' + Math.random().toString(16).substr(2, 8),
    username: 'mqtt-in2',
    password: 'mqtt-in2'
}

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

// create 10 fusion models
for (let i = start; i <= end; i++) {
    // PC
    // smConf["fusion"].nodes[0].nodeid = "N" + i;
    // smConf["fusion"].fusionModel = "N" + i + "_24h";
    connectionConfig.clientId = 'clientTrain_' + Math.random().toString(16).substr(2, 8);
    smConf["fusion"]["model"].horizon = horizons[i];
    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} // for