const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const fileManager = require('../utils/fileManager.js');
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
    "energy": [
        { "field": "pc", "tick": [
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
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "connection": {
        type: "none"  // kafka, mqtt
    },
    "fusionModel": "test",
    "fusionTick": 60 * 60 * 1000, // 1 hour
    "nodes": [
        {
            "type": "energy",
            "nodeid": "N1",
            "aggrConfigId": "energy",
            "fusionTick": 60 * 60 * 1000, // 1 hour
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                        // current time
                    { type: "value", "name": "pc" },
                    { type: "value", "name": "pc|ma|3600000" },     // 1h
                    { type: "value", "name": "pc|ma|21600000" },    // 6h
                    { type: "value", "name": "pc|ma|86400000" },    // 1d
                    { type: "value", "name": "pc|ma|604800000" },   // 1w
                    { type: "value", "name": "pc|ma|2592000000" },  // 1m

                    { type: "value", "name": "pc|min|86400000" },   // 1d
                    { type: "value", "name": "pc|min|604800000" },  // 1w

                    { type: "value", "name": "pc|max|86400000" },   // 1d
                    { type: "value", "name": "pc|max|604800000" },  // 1w

                    { type: "value", "name": "pc|variance|21600000" },    // 6h
                    { type: "value", "name": "pc|variance|86400000" },    // 1d
                    { type: "value", "name": "pc|variance|604800000" }    // 1w
                ]},
                { "time": -24, "attributes": [                       // 1d ago
                    { type: "value", "name": "pc" }
                ]},
                { "time": -48, "attributes": [                       // 2d ago
                    { type: "value", "name": "pc" }
                ]},
                { "time": -168, "attributes": [                      // 1w ago
                    { type: "value", "name": "pc" }
                ]}
            ]
        },
        {
            "type": "static",
            "nodeid": "static",
            "aggrConfigId": "static",
            "fusionTick": 60 * 60 * 1000, // 1 hour
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
            "fusionTick": 60 * 60 * 1000, // 1 hour
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

describe('streamingNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        base = new qm.Base({ dbPath: './db2/', mode: 'createClean' });
        sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, sn.base);
        })

        it('aggregates initialized', function() {
            assert.deepEqual(sn.aggregate, {});
        })

        it('config saved', function() {
            assert.deepEqual(sn.config, fusionConfig["nodes"][0]);
        })

        it('fusionNodeI correctly saved', function() {
            assert.equal(sn.fusionNodeI, 99);
        })

        it ('callback function should be set', function() {
            assert.equal(sn.processRecordCb, null);
        })

        it ('parent saved', function() {
            assert.equal(sn.parent, null);
        })

        it ('buffer empty', function() {
            assert.deepEqual(sn.buffer, []);
        })

        it ('buffer position is 0', function() {
            assert.equal(sn.position, 0);
        })

        it ('master flag set correctly', function() {
            assert.equal(sn.master, true);
        })

        it ('isMaster function', function() {
            assert.equal(sn.isMaster(), true);
        })

        it ('connectToKafka function exists', function() {
            assert.equal(typeof sn.connectToKafka, "function");
        })

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof sn.broadcastAggregates, "function");
        })

        it ('createAggregates function exists', function() {
            assert.equal(typeof sn.createAggregates, "function");
        })

        it ('offsetExists function exists', function() {
            assert.equal(typeof sn.offsetExists, "function");
        })

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof sn.deleteObsoleteRows, "function");
        })

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof sn.checkDataAvailability, "function");
        })

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof sn.setSlaveOffset, "function");
        })

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof sn.getOffsetTimestamp, "function");
        })

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof sn.getOffsetTimestamp, "function");
        })

        it ('getAggregates function exists', function() {
            assert.equal(typeof sn.getAggregates, "function");
        })

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof sn.getPartialFeatureVector, "function");
        })

        it ('master set correctly', function() {
            assert.equal(sn.isMaster(), true);
        })

        it ('master offset set correctly', function() {
            sn.setMasterOffset();
            assert.equal(sn.position, -1);
        })

        it ('slave offset set correctly: no data', function() {
            assert.equal(sn.setSlaveOffset(0), false);
        })
    });
});
