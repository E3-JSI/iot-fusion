// TRAIN SUBSTATION CONFIG
let config = {
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
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "voltage|ma|3600000" },
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "voltage|ma|21600000" },
                        { type: "value", "name": "current|ma|86400000" },
                        { type: "value", "name": "voltage|ma|86400000" },

                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "voltage|min|21600000" },
                        { type: "value", "name": "current|min|86400000" },
                        { type: "value", "name": "voltage|min|86400000" },

                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "voltage|max|21600000" },
                        { type: "value", "name": "current|max|86400000" },
                        { type: "value", "name": "voltage|max|86400000" },

                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "voltage|variance|21600000" },
                        { type: "value", "name": "current|variance|86400000" },
                        { type: "value", "name": "voltage|variance|86400000" },

                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                        { type: "value", "name": "voltage|ma|3600000" }
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                        { type: "value", "name": "voltage|ma|3600000" }
                    ]},
                    { "time": -7 * 24, "attributes": [                      // 1w ago
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
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "current|ma|86400000" },

                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "current|min|86400000" },

                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "current|max|86400000" },

                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "current|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -7 * 24, "attributes": [                      // 1w ago
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
                        { type: "value", "name": "current|ma|3600000" },        // first feature is also the predicted feature
                        { type: "value", "name": "current|ma|21600000" },
                        { type: "value", "name": "current|ma|86400000" },

                        { type: "value", "name": "current|min|21600000" },
                        { type: "value", "name": "current|min|86400000" },

                        { type: "value", "name": "current|max|21600000" },
                        { type: "value", "name": "current|max|86400000" },

                        { type: "value", "name": "current|variance|21600000" },
                        { type: "value", "name": "current|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -48, "attributes": [                              // 1d ago
                        { type: "value", "name": "current|ma|3600000" },
                    ]},
                    { "time": -7 * 24, "attributes": [                          // 1w ago
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

module.exports = config;
