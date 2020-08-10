const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTimeValueNode = require('../nodes/streamingTimeValueNode.js');
const streamingSmartLampNode = require('../nodes/streamingSmartLampNode.js');
const streamingTrafficCounterNode = require('../nodes/streamingTrafficCounterNode.js');
const streamingAirQualityNode = require('../nodes/streamingAirQualityNode.js');
const fileManager = require('../../common/utils/fileManager.js');
const qm = require('qminer');
const fs = require('fs');

// example of unit tests
var assert = require('assert');

// connection config
let connectionConfig = {
    zookeeper: "192.168.85.98:2181"
}

// basic aggregate config
let aggrConfigs = {
    "airquality": [
        { "field": "rh", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 1d
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w
                { "type": "ma" }
            ]}
        ]},
        { "field": "temp", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 1d
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w
                { "type": "ma" }
            ]}
        ]},
        { "field": "no2", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]}
        ]},
        { "field": "o3", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]}
        ]},
        { "field": "pm025", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]}
        ]},
        { "field": "pm100", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" },
                { "type": "min" },
                { "type": "max" },
                { "type": "variance" }
            ]}
        ]}
    ]
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "airquality",
    "connection": {
        "type": "mqtt"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "airquality",
            "nodeid": "airquality",
            "aggrConfigId": "airquality",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", "name": "pm100" },
                    { type: "value", "name": "t|ma|21600" },
                    { type: "value", "name": "no2|ma|86400000" },
                    { type: "value", "name": "o3|min|86400000" },
                    { type: "value", "name": "pm025|max|86400000" },
                    { type: "value", "name": "pm100|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "pm100" },
                    { type: "value", "name": "t|ma|21600" },
                    { type: "value", "name": "no2|ma|86400000" },
                    { type: "value", "name": "o3|min|86400000" },
                    { type: "value", "name": "pm025|max|86400000" },
                    { type: "value", "name": "pm100|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingAirQualityNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db4/');
        fileManager.createFolder('./db4/');
        // create base
        base = new qm.Base({ dbPath: './db4/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
        // stn = new streamingTrainNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // stvn = new streamingTimeValueNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // ssln = new streamingSmartLampNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // stcn = new streamingTrafficCounterNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        saqn = new streamingAirQualityNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, saqn.base);
        });

        it ('check if store exists', function() {
            assert.equal(saqn.rawstore.name, "airquality");
        });

        it ('check store structure', function() {
            assert.deepEqual(saqn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'rh', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 't', type: 'float', nullable: false, internal: false, primary: false },
                { id: 3, name: 'no2', type: 'float', nullable: false, internal: false, primary: false },
                { id: 4, name: 'o3', type: 'float', nullable: false, internal: false, primary: false },
                { id: 5, name: 'pm025', type: 'float', nullable: false, internal: false, primary: false },
                { id: 6, name: 'pm100', type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(saqn.aggregate).length, 50);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(saqn.aggregate), [
                "rh|tick",
                "rh|winbuf|21600000",
                "rh|ma|21600000",
                "rh|min|21600000",
                "rh|max|21600000",
                "rh|variance|21600000",
                "rh|winbuf|86400000",
                "rh|ma|86400000",
                "rh|min|86400000",
                "rh|max|86400000",
                "rh|variance|86400000",
                "rh|winbuf|604800000",
                "rh|ma|604800000",
                "t|tick",
                "t|winbuf|21600000",
                "t|ma|21600000",
                "t|min|21600000",
                "t|max|21600000",
                "t|variance|21600000",
                "t|winbuf|86400000",
                "t|ma|86400000",
                "t|min|86400000",
                "t|max|86400000",
                "t|variance|86400000",
                "t|winbuf|604800000",
                "t|ma|604800000",
                "no2|tick",
                "no2|winbuf|21600000",
                "no2|ma|21600000",
                "no2|min|21600000",
                "no2|max|21600000",
                "no2|variance|21600000",
                "o3|tick",
                "o3|winbuf|21600000",
                "o3|ma|21600000",
                "o3|min|21600000",
                "o3|max|21600000",
                "o3|variance|21600000",
                "pm025|tick",
                "pm025|winbuf|21600000",
                "pm025|ma|21600000",
                "pm025|min|21600000",
                "pm025|max|21600000",
                "pm025|variance|21600000",
                "pm100|tick",
                "pm100|winbuf|21600000",
                "pm100|ma|21600000",
                "pm100|min|21600000",
                "pm100|max|21600000",
                "pm100|variance|21600000",
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(saqn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(saqn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof saqn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(saqn.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(saqn.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(saqn.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(saqn.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(saqn.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof saqn.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof saqn.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof saqn.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof saqn.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof saqn.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof saqn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof saqn.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof saqn.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof saqn.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof saqn.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof saqn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(saqn.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            saqn.setMasterOffset();
            assert.equal(saqn.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(saqn.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {

        it ('data record saved correctly', function() {
            saqn.processRecord(JSON.parse('{"stampm": 1468493071000, "rh": 0.0, "t": 1.0, "no2": 2.0, "o3": 3.0, "pm025": 4.0, "pm100": 5.0 }'));
            saqn.processRecord(JSON.parse('{"stampm": 1468493072000, "rh": 1.0, "t": 2.0, "no2": 3.0, "o3": 4.0, "pm025": 5.0, "pm100": 6.0 }'));
            assert.equal(saqn.buffer.length, 2);
            assert.equal(saqn.buffer[0].pm100, 5.0);
            assert.equal(saqn.buffer[1].pm100, 6.0);
            assert.equal(saqn.buffer[1].rh, 1);
        });

        it ('Empty values in message set to 0', function() {
            saqn.processRecord(JSON.parse('{"stampm": 1468493073000}'));
            assert.equal(saqn.buffer.length, 3);
            assert.equal(saqn.buffer[2].pm100, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(saqn.buffer[1], {
                "stampm": 1468493072000,
                "no2": 3,
                "no2|max|21600000": 3,
                "no2|ma|21600000": 2.5,
                "no2|min|21600000": 2,
                "no2|variance|21600000": 0.5,
                "o3": 4,
                "o3|max|21600000": 4,
                "o3|ma|21600000": 3.5,
                "o3|min|21600000": 3,
                "o3|variance|21600000": 0.5,
                "pm025": 5,
                "pm025|max|21600000": 5,
                "pm025|ma|21600000": 4.5,
                "pm025|min|21600000": 4,
                "pm025|variance|21600000": 0.5,
                "pm100": 6,
                "pm100|max|21600000": 6,
                "pm100|ma|21600000": 5.5,
                "pm100|min|21600000": 5,
                "pm100|variance|21600000": 0.5,
                "rh": 1,
                "rh|max|21600000": 1,
                "rh|max|86400000": 1,
                "rh|ma|21600000": 0.5,
                "rh|ma|604800000": 0.5,
                "rh|ma|86400000": 0.5,
                "rh|min|21600000": 0,
                "rh|min|86400000": 0,
                "rh|variance|21600000": 0.5,
                "rh|variance|86400000": 0.5,
                "t": 2,
                "t|max|21600000": 2,
                "t|max|86400000": 2,
                "t|ma|21600000": 1.5,
                "t|ma|604800000": 1.5,
                "t|ma|86400000": 1.5,
                "t|min|21600000": 1,
                "t|min|86400000": 1,
                "t|variance|21600000": 0.5,
                "t|variance|86400000": 0.5
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let time = 1468493073000 + i * 1000;
                let rh = i + 1;
                let t = i + 2;
                let no2 = i + 3;
                let o3 = i + 4;
                let pm025 = i + 5;
                let pm100 = i + 6;
                saqn.processRecord(JSON.parse('{"stampm": ' + time + ', "rh": ' + rh + ', "t": ' + t + ', "no2": ' + no2 + ', "o3": ' + o3 + ', "pm025": ' + pm025 + ', "pm100": ' + pm100 + ' }'));
            }
            assert.equal(saqn.buffer.length, 12);

            assert.deepEqual(saqn.buffer[11], {
                "stampm": 1468493082000,
                "no2": 12,
                "no2|max|21600000": 12,
                "no2|ma|21600000": 6.416666666666667,
                "no2|min|21600000": 0,
                "no2|variance|21600000": 14.083333333333332,
                "o3": 13,
                "o3|max|21600000": 13,
                "o3|ma|21600000": 7.333333333333334,
                "o3|min|21600000": 0,
                "o3|variance|21600000": 15.333333333333332,
                "pm025": 14,
                "pm025|max|21600000": 14,
                "pm025|ma|21600000": 8.25,
                "pm025|min|21600000": 0,
                "pm025|variance|21600000": 16.75,
                "pm100": 15,
                "pm100|max|21600000": 15,
                "pm100|ma|21600000": 9.166666666666668,
                "pm100|min|21600000": 0,
                "pm100|variance|21600000": 18.333333333333336,
                "rh": 10,
                "rh|max|21600000": 10,
                "rh|max|86400000": 10,
                "rh|ma|21600000": 4.583333333333333,
                "rh|ma|604800000": 4.583333333333333,
                "rh|ma|86400000": 4.583333333333333,
                "rh|min|21600000": 0,
                "rh|min|86400000": 0,
                "rh|variance|21600000": 12.083333333333336,
                "rh|variance|86400000": 12.083333333333336,
                "t": 11,
                "t|max|21600000": 11,
                "t|max|86400000": 11,
                "t|ma|21600000": 5.5,
                "t|ma|604800000": 5.5,
                "t|ma|86400000": 5.5,
                "t|min|21600000": 0,
                "t|min|86400000": 0,
                "t|variance|21600000": 13,
                "t|variance|86400000": 13
            });
        });

        it ('duplicate insertions test', function() {
            saqn.processRecord(JSON.parse('{"stampm": 1468493071000, "pm100": 0.0, "v": 1 }'));
            saqn.processRecord(JSON.parse('{"stampm": 1468493072000, "pm100": 1.0, "v": 2 }'));
            assert.equal(saqn.buffer.length, 12);
        });
    });
});
