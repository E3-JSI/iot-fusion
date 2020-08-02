const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTimeValueNode = require('../nodes/streamingTimeValueNode.js');
const streamingSmartLampNode = require('../nodes/streamingSmartLampNode.js');
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
    "timevalue": [
        { "field": "value", "tick": [
            { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [          // 6h
                { "type": "ma" }
            ]},
            { "type": "winbuf", "winsize": 12 * 60 * 60 * 1000, "sub": [         // 12s
                {"type": "ma" },
                {"type": "min" },
                {"type": "max" },
                {"type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 1d
                {"type": "ma" },
                {"type": "min" },
                {"type": "max" },
                {"type": "variance" }
            ]},
            { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [         // 1w
                { "type": "ma" }
            ]}
        ]}
    ]
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "timevalue",
    "connection": {
        "type": "mqtt"
    },
    "fusionTick": 60 * 60 * 1000,
    "nodes": [
        {
            "type": "timevalue",
            "nodeid": "timevalue",
            "aggrConfigId": "timevalue",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                // current time
                    { type: "value", "name": "value" },
                    { type: "value", "name": "value|ma|86400000" },
                    { type: "value", "name": "value|min|86400000" },
                    { type: "value", "name": "value|max|86400000" },
                    { type: "value", "name": "value|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "value" },
                    { type: "value", "name": "value|ma|86400000" },
                    { type: "value", "name": "value|min|86400000" },
                    { type: "value", "name": "value|max|86400000" },
                    { type: "value", "name": "value|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingTimeValueNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db3/');
        fileManager.createFolder('./db3/');
        // create base
        base = new qm.Base({ dbPath: './db3/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
        // stn = new streamingTrainNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        stvn = new streamingTimeValueNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, stvn.base);
        });

        it ('check if store exists', function() {
            assert.equal(stvn.rawstore.name, "timevalue");
        });

        it ('check store structure', function() {
            assert.deepEqual(stvn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'value', type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(stvn.aggregate).length, 15);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(stvn.aggregate), [
                "value|tick",
                "value|winbuf|21600000",
                "value|ma|21600000",
                "value|winbuf|43200000",
                "value|ma|43200000",
                "value|min|43200000",
                "value|max|43200000",
                "value|variance|43200000",
                "value|winbuf|86400000",
                "value|ma|86400000",
                "value|min|86400000",
                "value|max|86400000",
                "value|variance|86400000",
                "value|winbuf|604800000",
                "value|ma|604800000"
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(stvn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(stvn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof stvn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(stvn.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(stvn.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(stvn.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(stvn.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(stvn.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof stvn.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof stvn.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof stvn.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof stvn.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof stvn.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof stvn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof stvn.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof stvn.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof stvn.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof stvn.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof stvn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(stvn.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            stvn.setMasterOffset();
            assert.equal(stvn.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(stvn.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {

        it ('data record saved correctly', function() {
            stvn.processRecord(JSON.parse('{"time": 1451606400,"value": 10.0}'));
            stvn.processRecord(JSON.parse('{"time": 1451610000,"value": 20.0}'));

            assert.equal(stvn.buffer.length, 2);
            assert.equal(stvn.buffer[0].value, 10.0);
            assert.equal(stvn.buffer[1].value, 20.0);
        });

        it ('Empty values in message set to 0', function() {
            stvn.processRecord(JSON.parse('{"time": 1451613600}'));
            assert.equal(stvn.buffer.length, 3);
            assert.equal(stvn.buffer[2].value, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(stvn.buffer[1], {
                "stampm": 1451610000000,
                "value": 20,
                "value|max|43200000": 20,
                "value|max|86400000": 20,
                "value|ma|21600000": 15,
                "value|ma|43200000": 15,
                "value|ma|604800000": 15,
                "value|ma|86400000": 15,
                "value|min|43200000": 10,
                "value|min|86400000": 10,
                "value|variance|43200000": 50,
                "value|variance|86400000": 50
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let time = 1451613600 + (i * 3600);
                let val = i + 3 * 10;
                stvn.processRecord(JSON.parse('{"time":' + time + ',"value": ' + val + '}'));
            }
            assert.equal(stvn.buffer.length,12);

            assert.deepEqual(stvn.buffer[11], {
                "stampm": 1451646000000,
                "value": 39,
                "value|max|43200000": 39,
                "value|max|86400000": 39,
                "value|ma|21600000": 36,
                "value|ma|43200000": 28.75,
                "value|ma|604800000": 28.75,
                "value|ma|86400000": 28.75,
                "value|min|43200000": 0,
                "value|min|86400000": 0,
                "value|variance|43200000": 151.47727272727272,
                "value|variance|86400000": 151.47727272727272
            });
        });

        it ('duplicate insertions test', function() {
            stvn.processRecord(JSON.parse('{"time": 1451606400,"value": 10.0}'));
            stvn.processRecord(JSON.parse('{"time": 1451610000,"value": 20.0}'));
            assert.equal(stvn.buffer.length, 12);
        });

    });
});
