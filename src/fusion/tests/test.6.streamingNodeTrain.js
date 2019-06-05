const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTrainNode = require('../nodes/streamingTrainNode.js');
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
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "train",
    "model": {
        horizon: 10,
        label: 0,
        dim:  null,
        options: {},
        method: "RecLinReg", // RecLinReg algorithm
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
                { "time": 0, "attributes": [                                // current time
                    { type: "value", "name": "icat" },
                    { type: "value", "name": "ucat" },
                    { type: "value", "name": "itcu1" },
                    { type: "value", "name": "itcu2" },
                    { type: "value", "name": "icsv" },
                    { type: "value", "name": "speed" },
                    { type: "value", "name": "latitude" },
                    { type: "value", "name": "longitude" }
                ]},
                { "time": -5 * 1000, "attributes": [                        // 5s ago
                    { type: "value", "name": "icat|ma|5000" },
                    { type: "value", "name": "ucat|ma|5000" },
                    { type: "value", "name": "itcu1|ma|5000" },
                    { type: "value", "name": "itcu2|ma|5000" },
                    { type: "value", "name": "icsv|ma|5000" },
                    { type: "value", "name": "speed|ma|5000" }
                ]},
                { "time": -10 * 1000, "attributes": [                       // 10s ago
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
                { "time": -30 * 1000, "attributes": [                       // 30s ago
                    { type: "value", "name": "icat|ma|30000" },
                    { type: "value", "name": "ucat|ma|30000" },
                    { type: "value", "name": "itcu1|ma|30000" },
                    { type: "value", "name": "itcu2|ma|30000" },
                    { type: "value", "name": "icsv|ma|30000" },
                    { type: "value", "name": "speed|ma|30000" }
                ]},
                { "time": -60 * 1000, "attributes": [                       // 1min ago
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
                ]},
                { "time": - 10 * 60 * 1000, "attributes": [                 // 10min ago
                    { type: "value", "name": "icat|ma|60000" },
                    { type: "value", "name": "ucat|ma|60000" },
                    { type: "value", "name": "itcu1|ma|60000" },
                    { type: "value", "name": "itcu2|ma|60000" },
                    { type: "value", "name": "icsv|ma|60000" },
                    { type: "value", "name": "speed|ma|60000" }
                ]},
                { "time": -  30 * 60 * 1000, "attributes": [                  // 30min ago
                    { type: "value", "name": "icat|ma|180000" },
                    { type: "value", "name": "ucat|ma|180000" },
                    { type: "value", "name": "itcu1|ma|180000" },
                    { type: "value", "name": "itcu2|ma|180000" },
                    { type: "value", "name": "icsv|ma|180000" },
                    { type: "value", "name": "speed|ma|180000" }
                ]},
                { "time": - 60 * 60 * 1000, "attributes": [                 // 1h ago
                    { type: "value", "name": "icat|ma|3600000" },
                    { type: "value", "name": "ucat|ma|360000" },
                    { type: "value", "name": "itcu1|ma|360000" },
                    { type: "value", "name": "itcu2|ma|360000" },
                    { type: "value", "name": "icsv|ma|360000" },
                    { type: "value", "name": "speed|ma|360000" }
                ]}
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingTrainNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        base = new qm.Base({ dbPath: './db2/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
        stn = new streamingTrainNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, stn.base);
        });

        it ('check if store exists', function() {
            assert.equal(stn.rawstore.name, "train");
        });

        it ('check store structure', function() {
            assert.deepEqual(stn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'long', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'lat',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 3, name: 'icsv',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 4, name: 'icat',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 5, name: 'itcu1',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 6, name: 'itcu2',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 7, name: 'speed',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 8, name: 'taext',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 9, name: 'taint',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 10, name: 'ucat',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 11, name: 'acc',
                type: 'float', nullable: false, internal: false, primary: false },
                { id: 12, name: 'pow',
                type: 'float', nullable: false, internal: false, primary: false }
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(stn.aggregate).length, 126);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(stn.aggregate), [
                "icat|tick",
                "icat|winbuf|5000",
                "icat|ma|5000",
                "icat|winbuf|10000",
                "icat|ma|10000",
                "icat|min|10000",
                "icat|max|10000",
                "icat|variance|10000",
                "icat|winbuf|30000",
                "icat|ma|30000",
                "icat|winbuf|60000",
                "icat|ma|60000",
                "icat|min|60000",
                "icat|max|60000",
                "icat|variance|60000",
                "icat|winbuf|600000",
                "icat|ma|600000",
                "icat|winbuf|1800000",
                "icat|ma|1800000",
                "icat|winbuf|3600000",
                "icat|ma|3600000",
                "ucat|tick",
                "ucat|winbuf|5000",
                "ucat|ma|5000",
                "ucat|winbuf|10000",
                "ucat|ma|10000",
                "ucat|min|10000",
                "ucat|max|10000",
                "ucat|variance|10000",
                "ucat|winbuf|30000",
                "ucat|ma|30000",
                "ucat|winbuf|60000",
                "ucat|ma|60000",
                "ucat|min|60000",
                "ucat|max|60000",
                "ucat|variance|60000",
                "ucat|winbuf|600000",
                "ucat|ma|600000",
                "ucat|winbuf|1800000",
                "ucat|ma|1800000",
                "ucat|winbuf|3600000",
                "ucat|ma|3600000",
                "itcu1|tick",
                "itcu1|winbuf|5000",
                "itcu1|ma|5000",
                "itcu1|winbuf|10000",
                "itcu1|ma|10000",
                "itcu1|min|10000",
                "itcu1|max|10000",
                "itcu1|variance|10000",
                "itcu1|winbuf|30000",
                "itcu1|ma|30000",
                "itcu1|winbuf|60000",
                "itcu1|ma|60000",
                "itcu1|min|60000",
                "itcu1|max|60000",
                "itcu1|variance|60000",
                "itcu1|winbuf|600000",
                "itcu1|ma|600000",
                "itcu1|winbuf|1800000",
                "itcu1|ma|1800000",
                "itcu1|winbuf|3600000",
                "itcu1|ma|3600000",
                "itcu2|tick",
                "itcu2|winbuf|5000",
                "itcu2|ma|5000",
                "itcu2|winbuf|10000",
                "itcu2|ma|10000",
                "itcu2|min|10000",
                "itcu2|max|10000",
                "itcu2|variance|10000",
                "itcu2|winbuf|30000",
                "itcu2|ma|30000",
                "itcu2|winbuf|60000",
                "itcu2|ma|60000",
                "itcu2|min|60000",
                "itcu2|max|60000",
                "itcu2|variance|60000",
                "itcu2|winbuf|600000",
                "itcu2|ma|600000",
                "itcu2|winbuf|1800000",
                "itcu2|ma|1800000",
                "itcu2|winbuf|3600000",
                "itcu2|ma|3600000",
                "icsv|tick",
                "icsv|winbuf|5000",
                "icsv|ma|5000",
                "icsv|winbuf|10000",
                "icsv|ma|10000",
                "icsv|min|10000",
                "icsv|max|10000",
                "icsv|variance|10000",
                "icsv|winbuf|30000",
                "icsv|ma|30000",
                "icsv|winbuf|60000",
                "icsv|ma|60000",
                "icsv|min|60000",
                "icsv|max|60000",
                "icsv|variance|60000",
                "icsv|winbuf|600000",
                "icsv|ma|600000",
                "icsv|winbuf|1800000",
                "icsv|ma|1800000",
                "icsv|winbuf|3600000",
                "icsv|ma|3600000",
                "speed|tick",
                "speed|winbuf|5000",
                "speed|ma|5000",
                "speed|winbuf|10000",
                "speed|ma|10000",
                "speed|min|10000",
                "speed|max|10000",
                "speed|variance|10000",
                "speed|winbuf|30000",
                "speed|ma|30000",
                "speed|winbuf|60000",
                "speed|ma|60000",
                "speed|min|60000",
                "speed|max|60000",
                "speed|variance|60000",
                "speed|winbuf|600000",
                "speed|ma|600000",
                "speed|winbuf|1800000",
                "speed|ma|1800000",
                "speed|winbuf|3600000",
                "speed|ma|3600000"
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(stn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(stn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof stn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(stn.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(stn.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(stn.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(stn.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(stn.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof stn.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof stn.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof stn.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof stn.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof stn.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof stn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof stn.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof stn.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof stn.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof stn.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof stn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(stn.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            stn.setMasterOffset();
            assert.equal(stn.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(stn.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {
        it ('data record saved correctly', function() {
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:06Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":0.1,"taext":12.1,"taint":11.3,"ucat":230}'));
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:07Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":5.1,"taext":12.1,"taint":11.3,"ucat":230}'));

            assert.equal(stn.buffer.length, 2);
            assert.equal(stn.buffer[0].long, 4.00544077);
            assert.equal(stn.buffer[0].lat, 49.22326688);
            assert.equal(stn.buffer[0].icat, 2);
            assert.equal(stn.buffer[0].icsv, 0.0853333333333);
            assert.equal(stn.buffer[0].itcu1, -0.113968333333);
            assert.equal(stn.buffer[0].itcu2, -0.0772666666667);
            assert.equal(stn.buffer[0].speed, 0.1);
            assert.equal(stn.buffer[0].taext, 12.1);
            assert.equal(stn.buffer[0].taint, 11.3);
            assert.equal(stn.buffer[0].ucat, 230);
            assert.equal(stn.buffer[0].pow, 460);
        });

        it ('Empty values in message set to 0', function() {
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:08Z"}'));
            assert.equal(stn.buffer.length, 3);
            assert.equal(stn.buffer[2].long, 0);
            assert.equal(stn.buffer[2].lat, 0);
            assert.equal(stn.buffer[2].icat, 0);
            assert.equal(stn.buffer[2].icsv, 0);
            assert.equal(stn.buffer[2].itcu1, 0);
            assert.equal(stn.buffer[2].itcu2, 0);
            assert.equal(stn.buffer[2].speed, 0);
            assert.equal(stn.buffer[2].taext, 0);
            assert.equal(stn.buffer[2].taint, 0);
            assert.equal(stn.buffer[2].ucat, 0);
            assert.equal(stn.buffer[2].pow, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(stn.buffer[1], {
                stampm: 1438225987000,
                "acc": 5,
                "icat": 2,
                "icat|max|10000": 2,
                "icat|max|60000": 2,
                "icat|ma|10000": 2,
                "icat|ma|1800000": 2,
                "icat|ma|30000": 2,
                "icat|ma|3600000": 2,
                "icat|ma|5000": 2,
                "icat|ma|60000": 2,
                "icat|ma|600000": 2,
                "icat|min|10000": 2,
                "icat|min|60000": 2,
                "icat|variance|10000": 0,
                "icat|variance|60000": 0,
                "icsv": 0.0853333333333,
                "icsv|max|10000": 0.0853333333333,
                "icsv|max|60000": 0.0853333333333,
                "icsv|ma|10000": 0.0853333333333,
                "icsv|ma|1800000": 0.0853333333333,
                "icsv|ma|30000": 0.0853333333333,
                "icsv|ma|3600000": 0.0853333333333,
                "icsv|ma|5000": 0.0853333333333,
                "icsv|ma|60000": 0.0853333333333,
                "icsv|ma|600000": 0.0853333333333,
                "icsv|min|10000": 0.0853333333333,
                "icsv|min|60000": 0.0853333333333,
                "icsv|variance|10000": 0,
                "icsv|variance|60000": 0,
                "itcu1": -0.113968333333,
                "itcu1|max|10000": -0.113968333333,
                "itcu1|max|60000": -0.113968333333,
                "itcu1|ma|10000": -0.113968333333,
                "itcu1|ma|1800000": -0.113968333333,
                "itcu1|ma|30000": -0.113968333333,
                "itcu1|ma|3600000": -0.113968333333,
                "itcu1|ma|5000": -0.113968333333,
                "itcu1|ma|60000": -0.113968333333,
                "itcu1|ma|600000": -0.113968333333,
                "itcu1|min|10000": -0.113968333333,
                "itcu1|min|60000": -0.113968333333,
                "itcu1|variance|10000": 0,
                "itcu1|variance|60000": 0,
                "itcu2": -0.0772666666667,
                "itcu2|max|10000": -0.0772666666667,
                "itcu2|max|60000": -0.0772666666667,
                "itcu2|ma|10000": -0.0772666666667,
                "itcu2|ma|1800000": -0.0772666666667,
                "itcu2|ma|30000": -0.0772666666667,
                "itcu2|ma|3600000": -0.0772666666667,
                "itcu2|ma|5000": -0.0772666666667,
                "itcu2|ma|60000": -0.0772666666667,
                "itcu2|ma|600000": -0.0772666666667,
                "itcu2|min|10000": -0.0772666666667,
                "itcu2|min|60000": -0.0772666666667,
                "itcu2|variance|10000": 0,
                "itcu2|variance|60000": 0,
                "lat": 49.22326688,
                "long": 4.00544077,
                "pow": 460,
                "speed": 5.1,
                "speed|max|10000": 5.1,
                "speed|max|60000": 5.1,
                "speed|ma|10000": 2.6,
                "speed|ma|1800000": 2.6,
                "speed|ma|30000": 2.6,
                "speed|ma|3600000": 2.6,
                "speed|ma|5000": 2.6,
                "speed|ma|60000": 2.6,
                "speed|ma|600000": 2.6,
                "speed|min|10000": 0.1,
                "speed|min|60000": 0.1,
                "speed|variance|10000": 12.499999999999998,
                "speed|variance|60000": 12.499999999999998,
                "stampm": 1438225987000,
                "taext": 12.1,
                "taint": 11.3,
                "ucat": 230,
                "ucat|max|10000": 230,
                "ucat|max|60000": 230,
                "ucat|ma|10000": 230,
                "ucat|ma|1800000": 230,
                "ucat|ma|30000": 230,
                "ucat|ma|3600000": 230,
                "ucat|ma|5000": 230,
                "ucat|ma|60000": 230,
                "ucat|ma|600000": 230,
                "ucat|min|10000": 230,
                "ucat|min|60000": 230,
                "ucat|variance|10000": 0,
                "ucat|variance|60000": 0
            });
        });

        it ('9 more data insertions', function() {
            for (let i = 1; i <= 9; i++) {
                let a = "2015-07-30T03:13:" + 1+i + "Z";
                a= '"'+a+'"';
                stn.processRecord(JSON.parse('{"time":' + a + ',"long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":5,"taext":12.1,"taint":11.3,"ucat":230}'));
                }
            assert.equal(stn.buffer.length,12);
        });

        it ('duplicate insertions test', function() {
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:06Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":10.1,"taext":12.1,"taint":11.3,"ucat":230}'));
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:06Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":10.1,"taext":12.1,"taint":11.3,"ucat":230}'));
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:06Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":0.1,"taext":12.1,"taint":11.3,"ucat":230}'));
            assert.equal(stn.buffer.length,12);

        });

        it ('missing values test', function() {
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:20Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":10,"taext":12.1,"taint":11.3,"ucat":230}'));
            stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:22Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":20,"taext":12.1,"taint":11.3,"ucat":230}'));
            assert.equal(stn.buffer.length,14);
        });
    });
});
