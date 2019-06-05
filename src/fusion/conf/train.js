// TRAIN OBOARD CONFIG
let config = {
    "aggr": {
        "train": [
            { "field": "acc", "tick": [
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [               // 10s
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [               // 30s
                    { "type": "max" },
                    { "type": "min" },
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [               // 1m
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "ma" },
                    { "type": "variance" }
                ]}
            ]},
            { "field": "icat", "tick": [
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [                // 10s
                    { "type": "ma" },
                    { "type": "variance" },
                    { "type": "min" },
                    { "type": "max" }
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [                // 30s
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 60 * 1000, "sub": [                // 1m
                    { "type": "max" },
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 10 * 60 * 1000, "sub": [           // 10m
                    { "type": "variance" },
                    { "type": "max" },
                    { "type": "ma" },
                ]}
            ]},
            { "field": "speed", "tick": [
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [                // 10s
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 30 * 1000, "sub": [                // 30s
                    { "type": "variance" },
                    { "type": "ma" },
                    { "type": "min" },
                    { "type": "max" },
                ]}
            ]},
            { "field": "ucat", "tick": [
                { "type": "winbuf", "winsize": 10 * 1000, "sub": [                // 10s
                    { "type": "ma" },
                ]}
            ]}
        ]
    },
    "fusion": {
        "fusionModel": "train",
        "model": {
            horizon: 10,
            label: 0,
            dim:  null,
            options: {},
            method: "RecLinReg", // RecLinReg
            topic: "predictions_train"
        },
        "connection": {
            "type": "mqtt"
        },
        "fusionTick": 1000,
        "nodes": [
            {
                "type": "train",
                "nodeid": "train",
                "aggrConfigId": "train",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                        // current time
                        { type: "value", "name": "icat" },
                        { type: "value", "name": "icat|ma|10000" },
                        { type: "value", "name": "icat|min|10000" },
                        { type: "value", "name": "icat|max|10000" },
                        { type: "value", "name": "icat|ma|30000" },
                        { type: "value", "name": "icat|max|30000" },
                        { type: "value", "name": "icat|ma|60000" },
                        { type: "value", "name": "icat|max|60000" },
                        { type: "value", "name": "lat" },
                        { type: "value", "name": "long" },
                        { type: "value", "name": "speed|ma|10000" },
                        { type: "value", "name": "speed|max|30000" },
                        { type: "value", "name": "speed|min|30000" },
                        { type: "value", "name": "acc" },
                        { type: "value", "name": "acc|ma|10000" },
                        { type: "value", "name": "acc|min|10000" },
                        { type: "value", "name": "acc|max|10000" },
                        { type: "value", "name": "acc|max|30000" },
                        { type: "value", "name": "acc|max|60000" }
                    ]},
                    { "time": -10, "attributes": [                       // 10min ago
                        { type: "value", "name": "icat|ma|10000" },
                        { type: "value", "name": "acc|max|10000" },
                        { type: "value", "name": "acc|ma|10000" }
                    ]}
                ]
            }
        ]
    }
};

module.exports = config;
