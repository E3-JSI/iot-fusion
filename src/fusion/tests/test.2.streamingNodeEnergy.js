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

describe('streamingEnergyNode', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        base = new qm.Base({ dbPath: './db2/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, sen.base);
        })

        it ('check if store exists', function() {
            assert.equal(sen.rawstore.name, "N1");
        })

        it ('check store structure', function() {
            assert.deepEqual(sen.rawstore.fields, [ { id: 0,
                name: 'Time',
                type: 'datetime',
                nullable: false,
                internal: false,
                primary: false },
                { id: 1,
                name: 'pc',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false },
                { id: 2,
                name: 'pg',
                type: 'float',
                nullable: false,
                internal: false,
                primary: false }
            ]);
        })

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(sen.aggregate).length, 18);
        })

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(sen.aggregate), [ 'pc|tick',
                'pc|winbuf|3600000',
                'pc|ma|3600000',
                'pc|winbuf|21600000',
                'pc|variance|21600000',
                'pc|ma|21600000',
                'pc|winbuf|86400000',
                'pc|variance|86400000',
                'pc|ma|86400000',
                'pc|min|86400000',
                'pc|max|86400000',
                'pc|winbuf|604800000',
                'pc|variance|604800000',
                'pc|ma|604800000',
                'pc|min|604800000',
                'pc|max|604800000',
                'pc|winbuf|2592000000',
                'pc|ma|2592000000' ]);
        })

        it('config saved', function() {
            assert.deepEqual(sen.config, fusionConfig["nodes"][0]);
        })

        it('fusionNodeI correctly saved', function() {
            assert.equal(sen.fusionNodeI, 99);
        })

        it ('callback function should be set', function() {
            assert.equal(typeof sen.processRecordCb, "function");
        })

        it ('parent saved', function() {
            assert.equal(sen.parent, null);
        })

        it ('buffer empty', function() {
            assert.deepEqual(sen.buffer, []);
        })

        it ('buffer position is 0', function() {
            assert.equal(sen.position, 0);
        })

        it ('master flag set correctly', function() {
            assert.equal(sen.master, true);
        })

        it ('isMaster function', function() {
            assert.equal(sen.isMaster(), true);
        })

        it ('connectToKafka function exists', function() {
            assert.equal(typeof sen.connectToKafka, "function");
        })

        it ('broadcastAggregates function exists', function() {
            assert.equal(typeof sen.broadcastAggregates, "function");
        })

        it ('createAggregates function exists', function() {
            assert.equal(typeof sen.createAggregates, "function");
        })

        it ('offsetExists function exists', function() {
            assert.equal(typeof sen.offsetExists, "function");
        })

        it ('deleteObsoleteRows function exists', function() {
            assert.equal(typeof sen.deleteObsoleteRows, "function");
        })

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof sen.checkDataAvailability, "function");
        })

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof sen.setSlaveOffset, "function");
        })

        it ('getOffsetTimestamp function exists', function() {
            assert.equal(typeof sen.getOffsetTimestamp, "function");
        })

        it ('setMasterOffset function exists', function() {
            assert.equal(typeof sen.getOffsetTimestamp, "function");
        })

        it ('getAggregates function exists', function() {
            assert.equal(typeof sen.getAggregates, "function");
        })

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof sen.getPartialFeatureVector, "function");
        })

        it ('master set correctly', function() {
            assert.equal(sen.isMaster(), true);
        })

        it ('master offset set correctly', function() {
            sen.setMasterOffset();
            assert.equal(sen.position, -1);
        })

        it ('slave offset set correctly: no data', function() {
            assert.equal(sen.setSlaveOffset(0), false);
        })
    });

    describe('data insertion', function() {
        it ('data record record saved correctly', function() {
            sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":1459926000,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}'));
            assert.equal(sen.buffer.length, 1);
            assert.equal(sen.buffer[0].pc, 6000);
            assert.equal(sen.buffer[0].pg, 0);
        });

        it ('stream aggregates calculated correctly for 1 insertion', function() {
            assert.deepEqual(sen.buffer[0], { 'pc|ma|3600000': 6000,
                stampm: 1459926000000,
                'pc|variance|21600000': 0,
                'pc|ma|21600000': 6000,
                'pc|variance|86400000': 0,
                'pc|ma|86400000': 6000,
                'pc|min|86400000': 6000,
                'pc|max|86400000': 6000,
                'pc|variance|604800000': 0,
                'pc|ma|604800000': 6000,
                'pc|min|604800000': 6000,
                'pc|max|604800000': 6000,
                'pc|ma|2592000000': 6000,
                pc: 6000,
                pg: 0 });
        });

        it ('11 more data insertions resampled by hour', function() {
            for (let i = 1; i <= 12; i++) {
                sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":' + (1459926000 + i * 1 * 60 * 15) +',"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":' + (6000 - i * 500) + ',"pg":0,"qc":0,"qg":0}'));
            }
            assert.equal(sen.buffer.length, 4);
        })

        it ('correct aggregate values', function() {
            assert.deepEqual(sen.buffer[sen.buffer.length - 1], { 'pc|ma|3600000': 1000,
                stampm: 1459936800000,
                'pc|variance|21600000': 3791666.6666666665,
                'pc|ma|21600000': 3000,
                'pc|variance|86400000': 3791666.6666666665,
                'pc|ma|86400000': 3000,
                'pc|min|86400000': 0,
                'pc|max|86400000': 6000,
                'pc|variance|604800000': 3791666.6666666665,
                'pc|ma|604800000': 3000,
                'pc|min|604800000': 0,
                'pc|max|604800000': 6000,
                'pc|ma|2592000000': 3000,
                pc: 0,
                pg: 0 });
        })

        it ('correct resampling if interval is higher than 15 minutes', function() {
            for (let i = 1; i <= 12; i++) {
                sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":' + (1459926000 + 12 * 60 * 15 + i * 1 * 60 * 60) +',"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":' + (6000 - i * 500) + ',"pg":0,"qc":0,"qg":0}'));
            }
            assert.equal(sen.buffer.length, 16);
        });

        it ('coorect partial feature vector', function() {
            for (let i = 13; i <= 600; i++) {
                sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"N1","stamp":' + (1459926000 + 12 * 60 * 15 + i * 1 * 60 * 60) +',"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":' + (6000 + i * 10) + ',"pg":0,"qc":0,"qg":0}'));
            }
            sen.setMasterOffset();
            assert.deepEqual(sen.getPartialFeatureVector(), [
                12000,
                11995,
                11970,
                11880.000000000002,
                11159.999999999998,
                8812.756933115808,
                11760,
                10320,
                12000,
                12000,
                466.666666670392,
                5416.666666648331,
                239416.66666666916,
                11760,
                11520,
                10320
            ]);
        })
    });
});

describe('streamingEnergyNode - exdended', function() {
    let base;
    let sn;

    before(function() {
        fileManager.removeFolder('./db2-1/');
        fileManager.createFolder('./db2-1/');
        // create base
        base = new qm.Base({ dbPath: './db2-1/', mode: 'createClean' });
        // sn = new streamingNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, null, 99, null);
        sen = new streamingEnergyNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        // swn = new streamingWeatherNode(base, connectionConfig, fusionConfig["nodes"][2], aggrConfigs, null, 99, null);
        // ssn = new streamingStaticNode(base, connectionConfig, fusionConfig["nodes"][1], aggrConfigs, null, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('check missing values', function() {
        it('check missing values', function() {
            for (let i = 0; i < 200; i++) {
                if (i != 175) sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":' + (1459926000 + i * 1 * 60 * 60) +',"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":' + i.toString() + ',"pg":0,"qc":0,"qg":0}'));
                else console.log("Missing! Index = " + i);
            }
            assert.equal(sen.buffer.length, 199);
            sen.setMasterOffset();

            assert.deepEqual(sen.getPartialFeatureVector(), [
                199,
                198.5,
                195.99999999999994,
                187.50000000000003,
                114.64285714285718,
                99.12060301507536,
                176,
                31,
                199,
                199,
                4.666666666669188,
                49.99999999999848,
                2386.8177929854573,
                174,
                151,
                31
            ]);
        });

        it ('out of order record', function() {
            sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":1459926000,"stamp_db":1440098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}'));
            assert.equal(sen.buffer.length, 199);
        });

        it ('empty record', function() {
            sen.processRecord(JSON.parse('{}'));
            assert.equal(sen.buffer.length, 199);
        });

        it ('null values record', function() {
            let i = 200;
            sen.processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":' + (1459926000 + i * 1 * 60 * 60) +',"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":null,"pg":null,"qc":0,"qg":0}'));
            assert.equal(sen.buffer.length, 200);
            assert.equal(sen.buffer[199].pc, 0);
        });
    })
});