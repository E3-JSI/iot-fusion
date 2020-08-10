const fileManager = require('../../common/utils/fileManager.js');
const StreamFusion = require('../streamFusion.js');
const qm = require('qminer');
const fs = require('fs');

// example of unit tests
var assert = require('assert');

// connectionConfig
let connectionConfig = {
    zookeeper: '192.168.85.98:2181'
}

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
            "type": "none"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "nodes": [
            {
                "type": "timevalue",
                "nodeid": "N1",
                "aggrConfigId": "timevalue",
                "master": true,
                "fusionTick": 60 * 60 * 1000,
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
                    ]}
                ]
            },
            {
                "type": "static",
                "nodeid": "S1",
                "aggrConfigId": "static",
                "fusionTick": 60 * 60 * 1000,
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

describe('streamFusion', function() {
    let fusion;

    before(function() {
        fileManager.removeFolder('./db-1/');
        fileManager.createFolder('./db-1/');
        // create base
        fusion = new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"])
    });

    after(function() {
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(typeof fusion.base, "object");
        })

        it ('check number of fusion objects', function() {
            assert.equal(fusion.nodes.length, 2);
        });

        it ('check number of stores', function() {
            assert.equal(fusion.base.getStats().stores.length, 2);
        })

        it ('check fusion model name', function() {
            assert.equal(fusion.fusion_id, "N1_24h");
        })

        it ('check features topic name', function() {
            assert.equal(fusion.topic, "features_N1_24h");
        })

        it ('check types of nodes', function() {
            assert.equal(fusion.nodes[0].constructor.name, "streamingTimeValueNode");
            assert.equal(fusion.nodes[1].constructor.name, "streamingStaticNode");
        })

        it ('global config correct', function() {
            assert.deepEqual(fusion.config, smConf["fusion"]);
        })

        it ('feature vector ok', function() {
            // fill in static
            let json = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 0, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');
            fusion.nodes[1].processRecord(json);
            for (let i = 1; i <= 73; i++) {
                json.timestamp = i * 60 * 60 * 1000;
                json.timeOfDay = i % 24;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.dayOfWeek = Math.floor(i / 24) + 2;
                json.dayOfMonth = Math.floor(i / 24) + 1;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.holiday = 0;
                fusion.nodes[1].processRecord(json);
            }

            // timevalue node
            for (let i = 1; i <= 48; i++) {
                let timestamp = i * 60 * 60;
                fusion.nodes[0].processRecord({ time: timestamp, value: i });
            }

            fusion.nodes[0].setMasterOffset();
            fusion.nodes[1].setSlaveOffset(0);

            assert.equal(fusion.nodes[0].getOffsetTimestamp(), 48 * 60 * 60 * 1000);

            assert.deepEqual(fusion.buildFeatureVector(), [
                48,                 // val
                45,                 // ma 6h
                42,                 // min 6h
                48,                 // max 6h
                4.666666666666667,  // var 6h
                36,                 // ma 24h
                24,                 // min 24h
                48,                 // max 24h
                54.166666666666664, // var 24h
                24,                 // hist val -1d
                1,                  // time of day
                0,                  // weekend
                0,                  // holiday
                0,                  // day After Holiday
                0,                  // day before holiday
                5,                  // day of week
                4,                  // day of year
                1                   // month of year
            ]);

            assert.equal(fusion.lastTimestamp, 48 * 60 * 60 * 1000);
        });

    });
});