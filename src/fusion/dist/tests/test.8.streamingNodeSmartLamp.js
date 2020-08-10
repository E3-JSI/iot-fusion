const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTimeValueNode = require('../nodes/streamingTimeValueNode.js');
const streamingSmartLampNode = require('../nodes/streamingSmartLampNode.js');
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
    "smartlamp": [
        { "field": "dimml", "tick": [
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
        { "field": "pact", "tick": [
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
    "fusionModel": "smartlamp",
    "connection": {
        "type": "mqtt"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "smartlamp",
            "nodeid": "smartlamp",
            "aggrConfigId": "smartlamp",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", "name": "dimml" },
                    { type: "value", "name": "pact|ma|21600" },
                    { type: "value", "name": "dimml|ma|86400000" },
                    { type: "value", "name": "dimml|min|86400000" },
                    { type: "value", "name": "dimml|max|86400000" },
                    { type: "value", "name": "dimml|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "dimml" },
                    { type: "value", "name": "pact" },
                    { type: "value", "name": "dimml|ma|86400000" },
                    { type: "value", "name": "dimml|min|86400000" },
                    { type: "value", "name": "dimml|max|86400000" },
                    { type: "value", "name": "dimml|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingSmartLampNode', function() {
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
        ssln = new streamingSmartLampNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, ssln.base);
        });

        it ('check if store exists', function() {
            assert.equal(ssln.rawstore.name, "smartlamp");
        });

        it ('check store structure', function() {
            assert.deepEqual(ssln.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'pact', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'dimml', type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(ssln.aggregate).length, 26);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(ssln.aggregate), [
                "dimml|tick",
                "dimml|winbuf|21600000",
                "dimml|ma|21600000",
                "dimml|min|21600000",
                "dimml|max|21600000",
                "dimml|variance|21600000",
                "dimml|winbuf|86400000",
                "dimml|ma|86400000",
                "dimml|min|86400000",
                "dimml|max|86400000",
                "dimml|variance|86400000",
                "dimml|winbuf|604800000",
                "dimml|ma|604800000",
                "pact|tick",
                "pact|winbuf|21600000",
                "pact|ma|21600000",
                "pact|min|21600000",
                "pact|max|21600000",
                "pact|variance|21600000",
                "pact|winbuf|86400000",
                "pact|ma|86400000",
                "pact|min|86400000",
                "pact|max|86400000",
                "pact|variance|86400000",
                "pact|winbuf|604800000",
                "pact|ma|604800000"
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(ssln.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(ssln.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof ssln.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(ssln.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(ssln.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(ssln.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(ssln.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(ssln.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof ssln.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof ssln.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof ssln.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof ssln.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof ssln.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof ssln.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof ssln.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof ssln.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof ssln.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof ssln.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof ssln.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(ssln.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            ssln.setMasterOffset();
            assert.equal(ssln.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(ssln.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {

        it ('data record saved correctly', function() {
            ssln.processRecord(JSON.parse('{"stampm": 1468493071000, "pact": 0.0, "dimml": 0 }'));
            ssln.processRecord(JSON.parse('{"stampm": 1468493072000, "pact": 1.0, "dimml": 1 }'));

            assert.equal(ssln.buffer.length, 2);
            assert.equal(ssln.buffer[0].dimml, 0.0);
            assert.equal(ssln.buffer[1].pact, 1.0);
        });

        it ('Empty values in message set to 0', function() {
            ssln.processRecord(JSON.parse('{"stampm": 1468493073000}'));
            assert.equal(ssln.buffer.length, 3);
            assert.equal(ssln.buffer[2].dimml, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(ssln.buffer[1], {
                "stampm": 1468493072000,
                "dimml": 1,
                "dimml|max|21600000": 1,
                "dimml|max|86400000": 1,
                "dimml|ma|21600000": 0.5,
                "dimml|ma|604800000": 0.5,
                "dimml|ma|86400000": 0.5,
                "dimml|min|21600000": 0,
                "dimml|min|86400000": 0,
                "dimml|variance|21600000": 0.5,
                "dimml|variance|86400000": 0.5,
                "pact": 1,
                "pact|max|21600000": 1,
                "pact|max|86400000": 1,
                "pact|ma|21600000": 0.5,
                "pact|ma|604800000": 0.5,
                "pact|ma|86400000": 0.5,
                "pact|min|21600000": 0,
                "pact|min|86400000": 0,
                "pact|variance|21600000": 0.5,
                "pact|variance|86400000": 0.5
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let time = 1468493073000 + i * 1000;
                let dimml = i + 1;
                let pact = i + 1;
                ssln.processRecord(JSON.parse('{"stampm":' + time + ',"dimml": ' + dimml + ',"pact": ' + pact + '}'));
            }
            assert.equal(ssln.buffer.length,12);

            assert.deepEqual(ssln.buffer[11], {
                "stampm": 1468493082000,
                "dimml": 10,
                "dimml|max|21600000": 10,
                "dimml|max|86400000": 10,
                "dimml|ma|21600000": 4.583333333333333,
                "dimml|ma|604800000": 4.583333333333333,
                "dimml|ma|86400000": 4.583333333333333,
                "dimml|min|21600000": 0,
                "dimml|min|86400000": 0,
                "dimml|variance|21600000": 12.083333333333336,
                "dimml|variance|86400000": 12.083333333333336,
                "pact": 10,
                "pact|max|21600000": 10,
                "pact|max|86400000": 10,
                "pact|ma|21600000": 4.583333333333333,
                "pact|ma|604800000": 4.583333333333333,
                "pact|ma|86400000": 4.583333333333333,
                "pact|min|21600000": 0,
                "pact|min|86400000": 0,
                "pact|variance|21600000": 12.083333333333336,
                "pact|variance|86400000": 12.083333333333336
            });
        });

        it ('duplicate insertions test', function() {
            ssln.processRecord(JSON.parse('{"stampm": 1468493071000, "pact": 0.0, "dimml": 0 }'));
            ssln.processRecord(JSON.parse('{"stampm": 1468493072000, "pact": 1.0, "dimml": 1 }'));
            assert.equal(ssln.buffer.length, 12);
        });
    });
});
