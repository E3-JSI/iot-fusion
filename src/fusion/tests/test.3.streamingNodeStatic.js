const streamingNode = require('../nodes/streamingNode.js');
const streamingEnergyNode = require('../nodes/streamingEnergyNode.js');
const streamingWeatherNode = require('../nodes/streamingWeatherNode.js');
const streamingStaticNode = require('../nodes/streamingStaticNode.js');
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

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingStaticNode', function() {
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
        ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, ssn.base);
        })

        it ('check if store exists', function() {
            assert.equal(ssn.rawstore.name, "static");
        })

        it ('check store structure', function() {
            assert.deepEqual(ssn.rawstore.fields, [ { id: 0,
                name: 'Time',
                type: 'datetime',
                nullable: false,
                internal: false,
                primary: false },
                { id: 1,
                name: 'dayAfterHoliday',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 2,
                name: 'dayBeforeHoliday',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 3,
                name: 'dayOfMonth',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 4,
                name: 'dayOfWeek',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 5,
                name: 'dayOfYear',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 6,
                name: 'holiday',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 7,
                name: 'monthOfYear',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 8,
                name: 'weekEnd',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false }
            ]);
        })

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(ssn.aggregate).length, 3);
        })

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(ssn.aggregate), [ 'holiday|tick',
                'holiday|winbuf|604800000',
                'holiday|ma|604800000',
            ]);
        })

        it('config saved', function() {
            assert.deepEqual(ssn.config, fusionConfig["nodes"][1]);
        })

        it('fusionNodeI correctly saved', function() {
            assert.equal(ssn.fusionNodeI, 99);
        })

        it ('callback function should be set', function() {
            assert.equal(typeof ssn.processRecordCb, "function");
        })

        it ('parent saved', function() {
            assert.equal(ssn.parent, null);
        })

        it ('buffer empty', function() {
            assert.deepEqual(ssn.buffer, []);
        })

        it ('buffer position is 0', function() {
            assert.equal(ssn.position, 0);
        })

        it ('master flag set correctly', function() {
            assert.equal(ssn.master, false);
        })

        it ('isMaster function', function() {
            assert.equal(ssn.isMaster(), false);
        })

        it ('connectToKafka function exists', function() {
            assert.equal(typeof ssn.connectToKafka, "function");
        })

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof ssn.broadcastAggregates, "function");
        })

        it ('createAggregates function exists', function() {
            assert.equal(typeof ssn.createAggregates, "function");
        })

        it ('offsetExists function exists', function() {
            assert.equal(typeof ssn.offsetExists, "function");
        })

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof ssn.deleteObsoleteRows, "function");
        })

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof ssn.checkDataAvailability, "function");
        })

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof ssn.setSlaveOffset, "function");
        })

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof ssn.getOffsetTimestamp, "function");
        })

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof ssn.getOffsetTimestamp, "function");
        })

        it ('getAggregates function exists', function() {
            assert.equal(typeof ssn.getAggregates, "function");
        })

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof ssn.getPartialFeatureVector, "function");
        })

        it ('master set correctly', function() {
            assert.equal(ssn.isMaster(), false);
        })

        it ('master offset set correctly', function() {
            ssn.setMasterOffset();
            assert.equal(ssn.position, -1);
        })

        it ('slave offset set correctly: no data', function() {
            assert.equal(ssn.setSlaveOffset(0), false);
        })
    });

    describe('data insertion', function() {

        it ('data record record saved correctly', function() {
            ssn.processRecord(JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }'));
            assert.equal(ssn.buffer.length, 1);
            assert.equal(ssn.buffer[0].timeOfDay, 0);
            assert.equal(ssn.buffer[0].dayAfterHoliday, 0);
            assert.equal(ssn.buffer[0].dayBeforeHoliday, 1);
            assert.equal(ssn.buffer[0].dayOfYear, 1);
            assert.equal(ssn.buffer[0].dayOfWeek, 2);
            assert.equal(ssn.buffer[0].dayOfMonth, 1);
            assert.equal(ssn.buffer[0].holiday, 1);
            assert.equal(ssn.buffer[0].monthOfYear, 1);
            assert.equal(ssn.buffer[0].weekEnd, 0);
        });

        it ('stream aggregates calculated correctly for 1 insertion', function() {
            assert.deepEqual(ssn.buffer[0], { "dayAfterHoliday": 0,
              "dayBeforeHoliday": 1,
              "dayOfMonth": 1,
              "dayOfWeek": 2,
              "dayOfYear": 1,
              "holiday": 1,
              "holiday|ma|604800000": 1,
              "monthOfYear": 1,
              "stampm": 0,
              "timeOfDay": 0,
              "weekEnd": 0 });
        });

        it ('24 more data insertions - check buffer', function() {
            let json = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');

            for (let i = 1; i <= 24; i++) {
                json.timestamp = i * 60 * 60 * 1000;
                json.timeOfDay = i % 24;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.dayOfWeek = Math.floor(i / 24) + 2;
                json.dayOfMonth = Math.floor(i / 24) + 1;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.holiday = 1 - Math.floor(i / 24);
                ssn.processRecord(json);
            }
            assert.equal(ssn.buffer.length, 25);
        })

        it ('correct aggregate values', function() {
            assert.deepEqual(ssn.getAggregates(), { 'holiday|ma|604800000': 0.96, "stampm": 86400000 });
        })

        it ('coorect partial feature vector', function() {

            ssn.setSlaveOffset(0);
            assert.deepEqual(ssn.getPartialFeatureVector(), [
                0, 0, 0, 0, 1, 3, 2, 1
            ]);
        })
    });
});