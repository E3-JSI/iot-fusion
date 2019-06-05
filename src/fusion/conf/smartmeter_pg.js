// SMARTMETER CONFIG FOR PG
let config = {
    "aggr": {
        "energy": [
            { "field": "pg", "tick": [
                { "type": "winbuf", "winsize": 1 * 60 * 60 * 1000, "sub": [
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [
                    { "type": "variance" },
                    { "type": "ma" },
                ]},
                { "type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [
                    { "type": "variance" },
                    { "type": "ma" },
                    { "type": "min" },
                    { "type": "max" }
                ]},
                { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [
                    { "type": "variance" },
                    { "type": "ma" },
                    { "type": "min" },
                    { "type": "max" }
                ]},
                { "type": "winbuf", "winsize": 30 * 24 * 60 * 60 * 1000, "sub": [
                    { "type": "ma" },
                ]}
            ]}
        ],
        "weather": [],
        "static": [
            { "field": "holiday", "tick": [
                { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [
                    { "type": "ma" }
                ]}
            ]}
        ]
    },
    "fusion": {
        "fusionModel": "test",
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 1000 * 1000,
        "nodes": [
            {
                "type": "energy",
                "nodeid": "N1",
                "aggrConfigId": "energy",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                        // current time
                        { type: "value", "name": "pg" },
                        { type: "value", "name": "pg|ma|3600000" },     // 1h
                        { type: "value", "name": "pg|ma|21600000" },    // 6h
                        { type: "value", "name": "pg|ma|86400000" },    // 1d
                        { type: "value", "name": "pg|ma|604800000" },   // 1w
                        { type: "value", "name": "pg|ma|2592000000" },  // 1m

                        { type: "value", "name": "pg|min|86400000" },   // 1d
                        { type: "value", "name": "pg|min|604800000" },  // 1w

                        { type: "value", "name": "pg|max|86400000" },   // 1d
                        { type: "value", "name": "pg|max|604800000" },  // 1w

                        { type: "value", "name": "pg|variance|21600000" },    // 6h
                        { type: "value", "name": "pg|variance|86400000" },    // 1d
                        { type: "value", "name": "pg|variance|604800000" }    // 1w
                    ]},
                    { "time": -24, "attributes": [                       // 1d ago
                        { type: "value", "name": "pg" }
                    ]},
                    { "time": -48, "attributes": [                       // 2d ago
                        { type: "value", "name": "pg" }
                    ]},
                    { "time": -168, "attributes": [                      // 1w ago
                        { type: "value", "name": "pg" }
                    ]}
                ]
            },
            {
                "type": "static",
                "nodeid": "static",
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
            },
            {
                "type": "weather",
                "nodeid": "weather",
                "aggrConfigId": "weather",
                "master": false,
                "attributes": [
                    { "time": 0, "attributes": [
                        { type: "value", name: "temperature24" },
                        { type: "value", name: "humidity24" },
                        { type: "value", name: "pressure24" },
                        { type: "value", name: "windSpeed24" },
                        { type: "value", name: "windBearing24" },
                        { type: "value", name: "cloudCover24" }
                    ]}
                ]
            }
        ]
    }
};

module.exports = config;