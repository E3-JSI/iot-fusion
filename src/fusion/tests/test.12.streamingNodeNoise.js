const streamingNoiseNode = require('../nodes/streamingNoiseNode.js');

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
    "noise": [
        { "field": "leak_state", "tick": [
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
        { "field": "noise_db", "tick": [
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
        { "field": "spre_db", "tick": [
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
    "fusionModel": "noise",
    "connection": {
        "type": "kafka"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "noise",
            "nodeid": "noise",
            "aggrConfigId": "noise",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", "name": "leak_state" },
                    { type: "value", "name": "noise_db" },
                    { type: "value", "name": "spre_db" },
                    { type: "value", "name": "leak_state|ma|86400000" },
                    { type: "value", "name": "leak_state|min|86400000" },
                    { type: "value", "name": "leak_state|max|86400000" },
                    { type: "value", "name": "leak_state|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "leak_state" },
                    { type: "value", "name": "noise_db" },
                    { type: "value", "name": "spre_db" },
                    { type: "value", "name": "leak_state|ma|86400000" },
                    { type: "value", "name": "leak_state|min|86400000" },
                    { type: "value", "name": "leak_state|max|86400000" },
                    { type: "value", "name": "leak_state|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingNoiseNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db5/');
        fileManager.createFolder('./db5/');
        // create base
        base = new qm.Base({ dbPath: './db5/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
        // stn = new streamingTrainNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // stvn = new streamingTimeValueNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // snn = new streamingSmartLampNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        //snn = new streamingTrafficCounterNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        snn = new streamingNoiseNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, snn.base);
        });

        it ('check if store exists', function() {
            assert.equal(snn.rawstore.name, "noise");
        });

        it ('check store structure', function() {
            assert.deepEqual(snn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'leak_state', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'noise_db', type: 'float', nullable: false, internal: false, primary: false },
                { id: 3, name: 'spre_db', type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(snn.aggregate).length, 39);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(snn.aggregate), [
                "leak_state|tick",
                "leak_state|winbuf|21600000",
                "leak_state|ma|21600000",
                "leak_state|min|21600000",
                "leak_state|max|21600000",
                "leak_state|variance|21600000",
                "leak_state|winbuf|86400000",
                "leak_state|ma|86400000",
                "leak_state|min|86400000",
                "leak_state|max|86400000",
                "leak_state|variance|86400000",
                "leak_state|winbuf|604800000",
                "leak_state|ma|604800000",
                "noise_db|tick",
                "noise_db|winbuf|21600000",
                "noise_db|ma|21600000",
                "noise_db|min|21600000",
                "noise_db|max|21600000",
                "noise_db|variance|21600000",
                "noise_db|winbuf|86400000",
                "noise_db|ma|86400000",
                "noise_db|min|86400000",
                "noise_db|max|86400000",
                "noise_db|variance|86400000",
                "noise_db|winbuf|604800000",
                "noise_db|ma|604800000",
                "spre_db|tick",
                "spre_db|winbuf|21600000",
                "spre_db|ma|21600000",
                "spre_db|min|21600000",
                "spre_db|max|21600000",
                "spre_db|variance|21600000",
                "spre_db|winbuf|86400000",
                "spre_db|ma|86400000",
                "spre_db|min|86400000",
                "spre_db|max|86400000",
                "spre_db|variance|86400000",
                "spre_db|winbuf|604800000",
                "spre_db|ma|604800000"
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(snn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(snn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof snn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(snn.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(snn.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(snn.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(snn.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(snn.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof snn.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof snn.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof snn.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof snn.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof snn.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof snn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof snn.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof snn.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof snn.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof snn.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof snn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(snn.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            snn.setMasterOffset();
            assert.equal(snn.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(snn.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {

        it ('data record saved correctly', function() {
            snn.processRecord(JSON.parse('{"time": 1468493071, "leak_state": 0.0, "noise_db": 1, "spre_db": 2}'));
            snn.processRecord(JSON.parse('{"time": 1468493072, "leak_state": 1.0, "noise_db": 2, "spre_db": 3}'));

            assert.equal(snn.buffer.length, 2);
            assert.equal(snn.buffer[0].leak_state, 0.0);
            assert.equal(snn.buffer[1].leak_state, 1.0);
            assert.equal(snn.buffer[1].noise_db, 2);
            assert.equal(snn.buffer[1].spre_db, 3);
        });

        it ('Empty values in message set to 0', function() {
            snn.processRecord(JSON.parse('{"time": 1468493073}'));
            assert.equal(snn.buffer.length, 3);
            assert.equal(snn.buffer[2].leak_state, 0);
            assert.equal(snn.buffer[2].noise_db, 0);
            assert.equal(snn.buffer[2].spre_db, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(snn.buffer[1], {
                "leak_state": 1,
                "leak_state|max|21600000": 1,
                "leak_state|max|86400000": 1,
                "leak_state|ma|21600000": 0.5,
                "leak_state|ma|604800000": 0.5,
                "leak_state|ma|86400000": 0.5,
                "leak_state|min|21600000": 0,
                "leak_state|min|86400000": 0,
                "leak_state|variance|21600000": 0.5,
                "leak_state|variance|86400000": 0.5,
                "noise_db": 2,
                "noise_db|max|21600000": 2,
                "noise_db|max|86400000": 2,
                "noise_db|ma|21600000": 1.5,
                "noise_db|ma|604800000": 1.5,
                "noise_db|ma|86400000": 1.5,
                "noise_db|min|21600000": 1,
                "noise_db|min|86400000": 1,
                "noise_db|variance|21600000": 0.5,
                "noise_db|variance|86400000": 0.5,
                "spre_db": 3,
                "spre_db|max|21600000": 3,
                "spre_db|max|86400000": 3,
                "spre_db|ma|21600000": 2.5,
                "spre_db|ma|604800000": 2.5,
                "spre_db|ma|86400000": 2.5,
                "spre_db|min|21600000": 2,
                "spre_db|min|86400000": 2,
                "spre_db|variance|21600000": 0.5,
                "spre_db|variance|86400000": 0.5,
                "stampm": 1468493072000
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let time = 1468493073 + i;
                let leak_state = i + 1;
                let noise_db = i + 2;
                let spre_db = i + 3;
                snn.processRecord(JSON.parse('{"time":' + time + ',"leak_state": ' + leak_state + ',"noise_db": ' + noise_db + ',"noise_db": ' + spre_db + '}'));
            }   
            assert.equal(snn.buffer.length,12);

            assert.deepEqual(snn.buffer[11], {
                "leak_state": 10,
                "leak_state|max|21600000": 10,
                "leak_state|max|86400000": 10,
                "leak_state|ma|21600000": 4.583333333333333,
                "leak_state|ma|604800000": 4.583333333333333,
                "leak_state|ma|86400000": 4.583333333333333,
                "leak_state|min|21600000": 0,
                "leak_state|min|86400000": 0,
                "leak_state|variance|21600000": 12.083333333333336,
                "leak_state|variance|86400000": 12.083333333333336,
                "noise_db": 12,
                "noise_db|max|21600000": 12,
                "noise_db|max|86400000": 12,
                "noise_db|ma|21600000": 6.25,
                "noise_db|ma|604800000": 6.25,
                "noise_db|ma|86400000": 6.25,
                "noise_db|min|21600000": 0,
                "noise_db|min|86400000": 0,
                "noise_db|variance|21600000": 15.659090909090908,
                "noise_db|variance|86400000": 15.659090909090908,
                "spre_db": 0,
                "spre_db|max|21600000": 3,
                "spre_db|max|86400000": 3,
                "spre_db|ma|21600000": 0.41666666666666663,
                "spre_db|ma|604800000": 0.41666666666666663,
                "spre_db|ma|86400000": 0.41666666666666663,
                "spre_db|min|21600000": 0,
                "spre_db|min|86400000": 0,
                "spre_db|variance|21600000": 0.9924242424242422,
                "spre_db|variance|86400000": 0.9924242424242422,
                "stampm": 1468493082000
            });
        });

        it ('duplicate insertions test', function() {
            snn.processRecord(JSON.parse('{"stampm": 1468493071, "carno": 0.0, "v": 1 }'));
            snn.processRecord(JSON.parse('{"stampm": 1468493072, "carno": 1.0, "v": 2 }'));
            assert.equal(snn.buffer.length, 12);
        });
    });
});