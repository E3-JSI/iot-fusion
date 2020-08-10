const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTimeValueNode = require('../nodes/streamingTimeValueNode.js');
const streamingSmartLampNode = require('../nodes/streamingSmartLampNode.js');
const streamingTrafficCounterNode = require('../nodes/streamingTrafficCounterNode.js');
const fileManager = require('../common/utils/fileManager.js');
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
    "trafficcounter": [
        { "field": "carno", "tick": [
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
        { "field": "v", "tick": [
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
        ]}
    ]
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "trafficcounter",
    "connection": {
        "type": "mqtt"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "trafficcounter",
            "nodeid": "trafficcounter",
            "aggrConfigId": "trafficcounter",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", "name": "carno" },
                    { type: "value", "name": "v|ma|21600" },
                    { type: "value", "name": "carno|ma|86400000" },
                    { type: "value", "name": "carno|min|86400000" },
                    { type: "value", "name": "carno|max|86400000" },
                    { type: "value", "name": "carno|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "carno" },
                    { type: "value", "name": "v" },
                    { type: "value", "name": "carno|ma|86400000" },
                    { type: "value", "name": "carno|min|86400000" },
                    { type: "value", "name": "carno|max|86400000" },
                    { type: "value", "name": "carno|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingTrafficCounterNode', function() {
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
        // stcn = new streamingSmartLampNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        stcn = new streamingTrafficCounterNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, stcn.base);
        });

        it ('check if store exists', function() {
            assert.equal(stcn.rawstore.name, "trafficcounter");
        });

        it ('check store structure', function() {
            assert.deepEqual(stcn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'carno', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'v', type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(stcn.aggregate).length, 26);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(stcn.aggregate), [
                "carno|tick",
                "carno|winbuf|21600000",
                "carno|ma|21600000",
                "carno|min|21600000",
                "carno|max|21600000",
                "carno|variance|21600000",
                "carno|winbuf|86400000",
                "carno|ma|86400000",
                "carno|min|86400000",
                "carno|max|86400000",
                "carno|variance|86400000",
                "carno|winbuf|604800000",
                "carno|ma|604800000",
                "v|tick",
                "v|winbuf|21600000",
                "v|ma|21600000",
                "v|min|21600000",
                "v|max|21600000",
                "v|variance|21600000",
                "v|winbuf|86400000",
                "v|ma|86400000",
                "v|min|86400000",
                "v|max|86400000",
                "v|variance|86400000",
                "v|winbuf|604800000",
                "v|ma|604800000"
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(stcn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(stcn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof stcn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(stcn.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(stcn.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(stcn.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(stcn.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(stcn.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof stcn.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof stcn.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof stcn.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof stcn.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof stcn.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof stcn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof stcn.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof stcn.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof stcn.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof stcn.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof stcn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(stcn.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            stcn.setMasterOffset();
            assert.equal(stcn.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(stcn.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {

        it ('data record saved correctly', function() {
            stcn.processRecord(JSON.parse('{"stampm": 1468493071000, "carno": 0.0, "v": 1 }'));
            stcn.processRecord(JSON.parse('{"stampm": 1468493072000, "carno": 1.0, "v": 2 }'));

            assert.equal(stcn.buffer.length, 2);
            assert.equal(stcn.buffer[0].carno, 0.0);
            assert.equal(stcn.buffer[1].carno, 1.0);
            assert.equal(stcn.buffer[1].v, 2);
        });

        it ('Empty values in message set to 0', function() {
            stcn.processRecord(JSON.parse('{"stampm": 1468493073000}'));
            assert.equal(stcn.buffer.length, 3);
            assert.equal(stcn.buffer[2].carno, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(stcn.buffer[1], {
                "stampm": 1468493072000,
                "carno": 1,
                "carno|max|21600000": 1,
                "carno|max|86400000": 1,
                "carno|ma|21600000": 0.5,
                "carno|ma|604800000": 0.5,
                "carno|ma|86400000": 0.5,
                "carno|min|21600000": 0,
                "carno|min|86400000": 0,
                "carno|variance|21600000": 0.5,
                "carno|variance|86400000": 0.5,
                "v": 2,
                "v|max|21600000": 2,
                "v|max|86400000": 2,
                "v|ma|21600000": 1.5,
                "v|ma|604800000": 1.5,
                "v|ma|86400000": 1.5,
                "v|min|21600000": 1,
                "v|min|86400000": 1,
                "v|variance|21600000": 0.5,
                "v|variance|86400000": 0.5
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let time = 1468493073000 + i * 1000;
                let carno = i + 1;
                let v = i + 2;
                stcn.processRecord(JSON.parse('{"stampm":' + time + ',"carno": ' + carno + ',"v": ' + v + '}'));
            }
            assert.equal(stcn.buffer.length,12);

            assert.deepEqual(stcn.buffer[11], {
                "stampm": 1468493082000,
                "carno": 10,
                "carno|max|21600000": 10,
                "carno|max|86400000": 10,
                "carno|ma|21600000": 4.583333333333333,
                "carno|ma|604800000": 4.583333333333333,
                "carno|ma|86400000": 4.583333333333333,
                "carno|min|21600000": 0,
                "carno|min|86400000": 0,
                "carno|variance|21600000": 12.083333333333336,
                "carno|variance|86400000": 12.083333333333336,
                "v": 11,
                "v|max|21600000": 11,
                "v|max|86400000": 11,
                "v|ma|21600000": 5.5,
                "v|ma|604800000": 5.5,
                "v|ma|86400000": 5.5,
                "v|min|21600000": 0,
                "v|min|86400000": 0,
                "v|variance|21600000": 13,
                "v|variance|86400000": 13
            });
        });

        it ('duplicate insertions test', function() {
            stcn.processRecord(JSON.parse('{"stampm": 1468493071000, "carno": 0.0, "v": 1 }'));
            stcn.processRecord(JSON.parse('{"stampm": 1468493072000, "carno": 1.0, "v": 2 }'));
            assert.equal(stcn.buffer.length, 12);
        });
    });
});
