const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
const streamingTrainNode = require('../nodes/streamingTrainNode.js');
const streamingSubstationNode = require('../nodes/streamingSubstationNode.js');
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
    "Substation": [
        { "field": "current", "tick": [
            { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [          // 1h sliding window
                { "type": "ma" },
            ]},
            { "type": "winbuf", "winsize": 6 *60 * 60 * 1000, "sub": [          // 6h sliding window
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
            ]}
        ]},
        { "field": "voltage", "tick": [
            { "type": "winbuf", "winsize": 60 * 60 * 1000, "sub": [          // 1h sliding window
                {"type": "ma" },
            ]},
            { "type": "winbuf", "winsize": 6 *60 * 60 * 1000, "sub": [          // 6h sliding window
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
            { "type": "winbuf", "winsize": 7 * 24* 60 * 60 * 1000, "sub": [     // 1w sliding window
                { "type": "ma" },
            ]}
        ]},
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
    "fusionModel": "N1_24h",                                        // name of the topic
    "connection": {
        "type": "kafka"
    },
    "fusionTick": 1000,                // in susbstationNode = 15 * 60 * 1000
    "nodes": [
        {
            "type": "Substation",
            "fusionTick": 1000,
            "nodeid": "N1",
            "aggrConfigId": "Substation",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                        // current features
                    { type: "value", "name": "current|ma|000" },    // first feature is also the predicted feature
                    { type: "value", "name": "voltage|ma|000" },
                ]},
                { "time": - 3600 * 1000, "attributes": [                                // 1h ago
                    { type: "value", "name": "current|ma|3600000" },
                    { type: "value", "name": "voltage|ma|3600000" }
                ]},
                { "time": - 6 * 3600 * 1000, "attributes": [                            // 6h ago
                    { type: "value", "name": "current|ma|21600000" },
                    { type: "value", "name": "current|max|21600000" },
                    { type: "value", "name": "current|min|21600000" },
                    { type: "value", "name": "current|variance|21600000" },
                    { type: "value", "name": "voltage|ma|21600000" },
                    { type: "value", "name": "voltage|max|21600000" },
                    { type: "value", "name": "voltage|min|21600000" },
                    { type: "value", "name": "voltage|variance|21600000" },
                ]},
                { "time": - 24 * 3600 * 1000, "attributes": [                           // 1d ago
                    { type: "value", "name": "current|ma|86400000" },
                    { type: "value", "name": "current|max|86400000" },
                    { type: "value", "name": "current|min|86400000" },
                    { type: "value", "name": "current|variance|86400000" },
                    { type: "value", "name": "voltage|ma|86400000" },
                    { type: "value", "name": "voltage|max|86400000" },
                    { type: "value", "name": "voltage|min|86400000" },
                    { type: "value", "name": "voltage|variance|86400000" },
                ]},
                { "time": - 7 * 24 * 3600 * 1000, "attributes": [                        // 1w ago
                    { type: "value", "name": "current|ma|604800000" },
                    { type: "value", "name": "voltage|ma|604800000" },
                ]}
            ]
        },
        {
            "type": "static",
            "nodeid": "S1",
            "aggrConfigId": "static",
            "master": false,
            "attributes": [
                { "time": 24 * 360* 1000, "attributes": [
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
            "nodeid": "W1",
            "aggrConfigId": "weather",
            "master": false,
            "attributes": [
                { "time": 0, "attributes": [                                // weather features are attributed with time
                    { type: "value", name: "temperature1" },                // horizon in the end of the name
                    { type: "value", name: "humidity1" },                   // 1 means 1 hour ahead
                    { type: "value", name: "pressure1" },                   // 24 would mean for 24 hours ahead
                    { type: "value", name: "windSpeed1" },                  // in this case change
                    { type: "value", name: "windBearing1" },                // temperature1 to temperature24 etc.
                    { type: "value", name: "cloudCover1" }
                ]}
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingSubstationNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        base = new qm.Base({ dbPath: './db2/', mode: 'createClean' });
        sen = new streamingSubstationNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        //ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
        //swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, sen.base);
        });

        it ('check if store exists', function() {
            assert.equal(sen.rawstore.name, "N1");
        });

        it ('check store structure', function() {
            assert.deepEqual(sen.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'current', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'voltage', type: 'float', nullable: false, internal: false, primary: false },
                { id: 3, name: 'power', type: 'float', nullable: false, internal: false, primary: false },
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(sen.aggregate).length, 30);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(sen.aggregate), [
                "current|tick",
                "current|winbuf|3600000",
                "current|ma|3600000",
                "current|winbuf|21600000",
                "current|ma|21600000",
                "current|max|21600000",
                "current|min|21600000",
                "current|variance|21600000",
                "current|winbuf|86400000",
                "current|ma|86400000",
                "current|max|86400000",
                "current|min|86400000",
                "current|variance|86400000",
                "current|winbuf|604800000",
                "current|ma|604800000",
                "voltage|tick",
                "voltage|winbuf|3600000",
                "voltage|ma|3600000",
                "voltage|winbuf|21600000",
                "voltage|ma|21600000",
                "voltage|max|21600000",
                "voltage|min|21600000",
                "voltage|variance|21600000",
                "voltage|winbuf|86400000",
                "voltage|ma|86400000",
                "voltage|max|86400000",
                "voltage|min|86400000",
                "voltage|variance|86400000",
                "voltage|winbuf|604800000",
                "voltage|ma|604800000",
            ]);
        });

        it('config saved', function() {
            assert.deepEqual(sen.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(sen.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof sen.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(sen.parent, null);
        });

        it ('buffer empty', function() {
            assert.deepEqual(sen.buffer, []);
        });

        it ('buffer position is 0', function() {
            assert.equal(sen.position, 0);
        });

        it ('master flag set correctly', function() {
            assert.equal(sen.master, true);
        });

        it ('isMaster function', function() {
            assert.equal(sen.isMaster(), true);
        });

        it ('connectToKafka function exists', function() {
            assert.equal(typeof sen.connectToKafka, "function");
        });

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof sen.broadcastAggregates, "function");
        });

        it ('createAggregates function exists', function() {
            assert.equal(typeof sen.createAggregates, "function");
        });

        it ('offsetExists function exists', function() {
            assert.equal(typeof sen.offsetExists, "function");
        });

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof sen.deleteObsoleteRows, "function");
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof sen.checkDataAvailability, "function");
        })

        it ('setSlaveOffset function exists', function() {
           assert.equal(typeof sen.setSlaveOffset, "function");
        });

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof sen.getOffsetTimestamp, "function");
        });

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof sen.getOffsetTimestamp, "function");
        });

        it ('getAggregates function exists', function() {
            assert.equal(typeof sen.getAggregates, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof sen.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(sen.isMaster(), true);
        });

        it ('master offset set correctly', function() {
            sen.setMasterOffset();
            assert.equal(sen.position, -1);
        });

        it ('slave offset set correctly: no data', function() {
            assert.equal(sen.setSlaveOffset(0), false);
        });
    });

    describe('data insertion', function() {
        it ('data record saved correctly', function() {
            sen.processRecord(JSON.parse('{"timestamp":1538737200000,"current":12,"voltage":232.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737201000,"current":13,"voltage":242.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737202000,"current":14,"voltage":252.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737213000,"current":15,"voltage":262.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737200000,"current":16,"voltage":232.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737201000,"current":17,"voltage":242.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737202000,"current":18,"voltage":252.45}'));
            sen.processRecord(JSON.parse('{"timestamp":1538737213000,"current":19,"voltage":262.45}'));

            //sen.processRecord(JSON.parse('{"timestamp":"1538407800","current":12,"voltage":100}'));
            //sen.processRecord(JSON.parse('{"timestamp":"1538408400","current":13,"voltage":120}'));
            //stn.processRecord(JSON.parse('{"time":"2015-07-30T03:13:07Z","long":4.00544077,"lat":49.22326688,"icat":2,"icsv":0.0853333333333,"itcu1":-0.113968333333,"itcu2":-0.0772666666667,"speed":5.1,"taext":12.1,"taint":11.3,"ucat":230}'));
            //sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","timestamp":1459926000,"stamp_db":1460098410,"current":232.45,"voltage":232.03}'));

            //assert.equal(sen.buffer.length, 2);
            //assert.equal(sen.buffer[0].: 1438225986000);
            //assert.equal(sen.buffer[0].current, 12);
            //assert.equal(sen.buffer[0].voltage, 49.22326688);
            // TODO!
            console.log("buffer values")
            console.log(sen.buffer)
        });
    });
});

