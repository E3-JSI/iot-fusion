const staticCalculationNode = require('../nodes/staticCalculatedNode.js');
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
let aggrConfigs = { };

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "staticCalculated",
    "connection": {
        "type": "mqtt"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "calculated",
            "nodeid": "calculated",
            "aggrConfigId": "calculated",
            "nodeFrequency": 3600000,
            "master": true,
            "holidays": [ '2020-08-21', '2020-08-19' ],
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", name: "hourOfDay" },
                    { type: "value", name: "dayOfWeek" },
                    { type: "value", name: "dayAfterHoliday" },
                    { type: "value", name: "dayBeforeHoliday" },
                    { type: "value", name: "dayOfYear" },
                    { type: "value", name: "dayOfMonth" },
                    { type: "value", name: "holiday" },
                    { type: "value", name: "monthOfYear" },
                    { type: "value", name: "weekEnd" }
                ]},
                { "time": -24, "attributes": [                                          // 24h ago
                    { type: "value", name: "dayAfterHoliday" },
                    { type: "value", name: "dayBeforeHoliday" },
                    { type: "value", name: "dayOfYear" },
                    { type: "value", name: "dayOfMonth" },
                    { type: "value", name: "holiday" },
                    { type: "timeDiff", name: "hourOfDay", interval: 5}
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('staticCalculatedNode', function() {
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
        // saqn = new streamingAirQualityNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
        scn = new staticCalculationNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(base, scn.base);
        });

        it('config saved', function() {
            assert.deepEqual(scn.config, fusionConfig["nodes"][0]);
        });

        it('fusionNodeI correctly saved', function() {
            assert.equal(scn.fusionNodeI, 99);
        });

        it ('callback function should be set', function() {
            assert.equal(typeof scn.processRecordCb, "function");
        });

        it ('parent saved', function() {
            assert.equal(scn.parent, null);
        });

        it ('isMaster function', function() {
            assert.equal(scn.isMaster(), false);
        });

        it ('checkDataAvailability function exists', function() {
            assert.equal(typeof scn.checkDataAvailability, "function");
        });

        it ('setSlaveOffset function exists', function() {
            assert.equal(typeof scn.setSlaveOffset, "function");
        });

        it ('getPartialFeatureVector function exists', function() {
            assert.equal(typeof scn.getPartialFeatureVector, "function");
        });

        it ('master set correctly', function() {
            assert.equal(scn.isMaster(), false);
        });

        it ('slave offset set correctly: no data needed', function() {
            assert.equal(scn.setSlaveOffset(0), true);
        });

        it ('holidays', function() {
            assert.deepEqual(scn.holidays, [ '2020-08-21', '2020-08-19' ]);
        });
    });

    describe('data retrieval', function() {

        it ('static values retrieved correctly', function() {
            const ts = 1597938533433;
            assert.equal(scn.staticValue(ts, "hourOfDay"), 17);
            assert.equal(scn.staticValue(ts, "dayOfWeek"), 4);
            assert.equal(scn.staticValue(ts, "dayOfMonth"), 20);
            assert.equal(scn.staticValue(ts, "monthOfYear"), 8);
            assert.equal(scn.staticValue(ts, "weekEnd"), 0);
            assert.equal(scn.staticValue(ts, "dayAfterHoliday"), 1);
            assert.equal(scn.staticValue(ts, "holiday"), 0);
            assert.equal(scn.staticValue(ts, "dayBeforeHoliday"), 1);
        });

        it ('calculated values retrieved correctly', function() {
            const ts = 1597938533433 + 24 * 60 * 60 * 1000;
            assert.equal(scn.calculateValue(ts, "hourOfDay"), 17);
            assert.equal(scn.calculateValue(ts, "dayOfWeek"), 5);
            assert.equal(scn.calculateValue(ts, "dayOfMonth"), 21);
            assert.equal(scn.calculateValue(ts, "monthOfYear"), 8);
            assert.equal(scn.calculateValue(ts, "weekEnd"), 0);
            assert.equal(scn.calculateValue(ts, "dayAfterHoliday"), 0);
            assert.equal(scn.calculateValue(ts, "holiday"), 1);
            assert.equal(scn.calculateValue(ts, "dayBeforeHoliday"), 0);
        });

        it ('check feature vector', function() {
            const ts = 1597938533433;
            scn.setSlaveOffset(ts);
            assert.deepEqual(scn.getPartialFeatureVector(), [ 17, 4, 1, 1, 233, 20, 0, 8, 0, 0, 0, 232, 19, 1, 5 ]);
        });


    });
});
