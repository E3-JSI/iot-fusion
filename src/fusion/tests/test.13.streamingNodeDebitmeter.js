const streamingDebitmeterNode = require('../nodes/streamingDebitmeterNode.js');

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
    "debitmeter": [
        { "field": "flow_rate_value", "tick": [
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
            ]}
        ]},
        { "field": "totalizer1", "tick": [
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
            ]}
        ]},
        { "field": "totalizer2", "tick": [
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
            ]}
        ]},
        { "field": "consumer_totalizer", "tick": [
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
            ]}
        ]},
        { "field": "analog_input1", "tick": [
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
            ]}
        ]},
        { "field": "analog_input2", "tick": [
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
            ]}
        ]},
        { "field": "batery_capacity", "tick": [
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
            ]}
        ]},
        { "field": "alarms_in_decimal", "tick": [
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
            ]}
        ]}
    ]
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfig = {
    "fusionModel": "debitmeter",
    "connection": {
        "type": "kafka"
    },
    "fusionTick": 60 * 60 * 1000,                                           // 1h
    "nodes": [
        {
            "type": "debitmeter",
            "nodeid": "debitmeter",
            "aggrConfigId": "debitmeter",
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                                           // current time
                    { type: "value", "name": "flow_rate_value" },
                    { type: "value", "name": "totalizer1" },
                    { type: "value", "name": "totalizer2" },
                    { type: "value", "name": "consumer_totalizer" },
                    { type: "value", "name": "analog_input1" },
                    { type: "value", "name": "analog_input2" },
                    { type: "value", "name": "batery_capacity" },
                    { type: "value", "name": "alarms_in_decimal" },
                    { type: "value", "name": "flow_rate_value|ma|86400000" },
                    { type: "value", "name": "flow_rate_value|min|86400000" },
                    { type: "value", "name": "flow_rate_value|max|86400000" },
                    { type: "value", "name": "flow_rate_value|variance|86400000" }
                ]},
                { "time": -24 * 60 * 60 * 1000, "attributes": [                        // 24h ago
                    { type: "value", "name": "flow_rate_value" },
                    { type: "value", "name": "totalizer1" },
                    { type: "value", "name": "totalizer2" },
                    { type: "value", "name": "consumer_totalizer" },
                    { type: "value", "name": "analog_input1" },
                    { type: "value", "name": "analog_input2" },
                    { type: "value", "name": "batery_capacity" },
                    { type: "value", "name": "alarms_in_decimal" },
                    { type: "value", "name": "flow_rate_value|ma|86400000" },
                    { type: "value", "name": "flow_rate_value|min|86400000" },
                    { type: "value", "name": "flow_rate_value|max|86400000" },
                    { type: "value", "name": "flow_rate_value|variance|86400000" }
                ]},
            ]
        }
    ]
}

function processRecordDummyCb(nodeI, parent) {
    return true;
}

describe('streamingDebitmeterNode', function() {
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
        snn = new streamingDebitmeterNode(base, connectionConfig, fusionConfig["nodes"][0], aggrConfigs, processRecordDummyCb, 99, null);
    });

    after(function() {
        base.close();
    });

    describe('initialization', function() {
        it ('base saved', function() {
            assert.equal(base, snn.base);
        });

        it ('check if store exists', function() {
            assert.equal(snn.rawstore.name, "debitmeter");
        });

        it ('check store structure', function() {
            assert.deepEqual(snn.rawstore.fields, [
                { id: 0, name: 'Time', type: 'datetime', nullable: false, internal: false, primary: false },
                { id: 1, name: 'flow_rate_value', type: 'float', nullable: false, internal: false, primary: false },
                { id: 2, name: 'totalizer1', type: 'float', nullable: false, internal: false, primary: false },
                { id: 3, name: 'totalizer2', type: 'float', nullable: false, internal: false, primary: false },
                { id: 4, name: 'consumer_totalizer', type: 'float', nullable: false, internal: false, primary: false },
                { id: 5, name: 'analog_input1', type: 'float', nullable: false, internal: false, primary: false },
                { id: 6, name: 'analog_input2', type: 'float', nullable: false, internal: false, primary: false },
                { id: 7, name: 'batery_capacity', type: 'float', nullable: false, internal: false, primary: false },
                { id: 8, name: 'alarms_in_decimal', type: 'float', nullable: false, internal: false, primary: false },
            ]);
        });

        it('aggregates initialized - number', function() {
            assert.equal(Object.keys(snn.aggregate).length, 88);
        });

        it('aggregates initialized - key names', function() {
            assert.deepEqual(Object.keys(snn.aggregate), [
                "flow_rate_value|tick",
                "flow_rate_value|winbuf|21600000",
                "flow_rate_value|ma|21600000",
                "flow_rate_value|min|21600000",
                "flow_rate_value|max|21600000",
                "flow_rate_value|variance|21600000",
                "flow_rate_value|winbuf|86400000",
                "flow_rate_value|ma|86400000",
                "flow_rate_value|min|86400000",
                "flow_rate_value|max|86400000",
                "flow_rate_value|variance|86400000",
                "totalizer1|tick",
                "totalizer1|winbuf|21600000",
                "totalizer1|ma|21600000",
                "totalizer1|min|21600000",
                "totalizer1|max|21600000",
                "totalizer1|variance|21600000",
                "totalizer1|winbuf|86400000",
                "totalizer1|ma|86400000",
                "totalizer1|min|86400000",
                "totalizer1|max|86400000",
                "totalizer1|variance|86400000",
                "totalizer2|tick",
                "totalizer2|winbuf|21600000",
                "totalizer2|ma|21600000",
                "totalizer2|min|21600000",
                "totalizer2|max|21600000",
                "totalizer2|variance|21600000",
                "totalizer2|winbuf|86400000",
                "totalizer2|ma|86400000",
                "totalizer2|min|86400000",
                "totalizer2|max|86400000",
                "totalizer2|variance|86400000",
                "consumer_totalizer|tick",
                "consumer_totalizer|winbuf|21600000",
                "consumer_totalizer|ma|21600000",
                "consumer_totalizer|min|21600000",
                "consumer_totalizer|max|21600000",
                "consumer_totalizer|variance|21600000",
                "consumer_totalizer|winbuf|86400000",
                "consumer_totalizer|ma|86400000",
                "consumer_totalizer|min|86400000",
                "consumer_totalizer|max|86400000",
                "consumer_totalizer|variance|86400000",
                "analog_input1|tick",
                "analog_input1|winbuf|21600000",
                "analog_input1|ma|21600000",
                "analog_input1|min|21600000",
                "analog_input1|max|21600000",
                "analog_input1|variance|21600000",
                "analog_input1|winbuf|86400000",
                "analog_input1|ma|86400000",
                "analog_input1|min|86400000",
                "analog_input1|max|86400000",
                "analog_input1|variance|86400000",
                "analog_input2|tick",
                "analog_input2|winbuf|21600000",
                "analog_input2|ma|21600000",
                "analog_input2|min|21600000",
                "analog_input2|max|21600000",
                "analog_input2|variance|21600000",
                "analog_input2|winbuf|86400000",
                "analog_input2|ma|86400000",
                "analog_input2|min|86400000",
                "analog_input2|max|86400000",
                "analog_input2|variance|86400000",
                "batery_capacity|tick",
                "batery_capacity|winbuf|21600000",
                "batery_capacity|ma|21600000",
                "batery_capacity|min|21600000",
                "batery_capacity|max|21600000",
                "batery_capacity|variance|21600000",
                "batery_capacity|winbuf|86400000",
                "batery_capacity|ma|86400000",
                "batery_capacity|min|86400000",
                "batery_capacity|max|86400000",
                "batery_capacity|variance|86400000",
                "alarms_in_decimal|tick",
                "alarms_in_decimal|winbuf|21600000",
                "alarms_in_decimal|ma|21600000",
                "alarms_in_decimal|min|21600000",
                "alarms_in_decimal|max|21600000",
                "alarms_in_decimal|variance|21600000",
                "alarms_in_decimal|winbuf|86400000",
                "alarms_in_decimal|ma|86400000",
                "alarms_in_decimal|min|86400000",
                "alarms_in_decimal|max|86400000",
                "alarms_in_decimal|variance|86400000"
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
            snn.processRecord(JSON.parse('{"time": 1468493071, "flow_rate_value": 0.0, "totalizer1": 1, "totalizer2": 2, "consumer_totalizer": 3, "analog_input1": 4, "analog_input2": 5, "batery_capacity": 6, "alarms_in_decimal": 7}' ));
            snn.processRecord(JSON.parse('{"time": 1468493072, "flow_rate_value": 1.0, "totalizer1": 2, "totalizer2": 3, "consumer_totalizer": 4, "analog_input1": 5, "analog_input2": 6, "batery_capacity": 7, "alarms_in_decimal": 8}' ));

            assert.equal(snn.buffer.length, 2);
            assert.equal(snn.buffer[0].flow_rate_value, 0.0);
            assert.equal(snn.buffer[1].flow_rate_value, 1.0);
            assert.equal(snn.buffer[1].totalizer1, 2);
            assert.equal(snn.buffer[1].totalizer2, 3);
            assert.equal(snn.buffer[1].consumer_totalizer, 4);
            assert.equal(snn.buffer[1].analog_input1, 5);
            assert.equal(snn.buffer[1].analog_input2, 6);
            assert.equal(snn.buffer[1].batery_capacity, 7);
            assert.equal(snn.buffer[1].alarms_in_decimal, 8);
        });

        it ('Empty values in message set to 0', function() {
            snn.processRecord(JSON.parse('{"time": 1468493073}'));
            assert.equal(snn.buffer.length, 3);
            assert.equal(snn.buffer[2].flow_rate_value, 0);
            assert.equal(snn.buffer[2].totalizer1, 0);
            assert.equal(snn.buffer[2].totalizer2, 0);
            assert.equal(snn.buffer[2].consumer_totalizer, 0);
            assert.equal(snn.buffer[2].analog_input1, 0);
            assert.equal(snn.buffer[2].analog_input2, 0);
            assert.equal(snn.buffer[2].batery_capacity, 0);
            assert.equal(snn.buffer[2].alarms_in_decimal, 0);
        });

        it ('stream aggregates calculated correctly for #2 insertion', function() {
            assert.deepEqual(snn.buffer[1], {
                "alarms_in_decimal": 8,
                "alarms_in_decimal|max|21600000": 8,
                "alarms_in_decimal|max|86400000": 8,
                "alarms_in_decimal|ma|21600000": 7.5,
                "alarms_in_decimal|ma|86400000": 7.5,
                "alarms_in_decimal|min|21600000": 7,
                "alarms_in_decimal|min|86400000": 7,
                "alarms_in_decimal|variance|21600000": 0.5,
                "alarms_in_decimal|variance|86400000": 0.5,
                "analog_input1": 5,
                "analog_input1|max|21600000": 5,
                "analog_input1|max|86400000": 5,
                "analog_input1|ma|21600000": 4.5,
                "analog_input1|ma|86400000": 4.5,
                "analog_input1|min|21600000": 4,
                "analog_input1|min|86400000": 4,
                "analog_input1|variance|21600000": 0.5,
                "analog_input1|variance|86400000": 0.5,
                "analog_input2": 6,
                "analog_input2|max|21600000": 6,
                "analog_input2|max|86400000": 6,
                "analog_input2|ma|21600000": 5.5,
                "analog_input2|ma|86400000": 5.5,
                "analog_input2|min|21600000": 5,
                "analog_input2|min|86400000": 5,
                "analog_input2|variance|21600000": 0.5,
                "analog_input2|variance|86400000": 0.5,
                "batery_capacity": 7,
                "batery_capacity|max|21600000": 7,
                "batery_capacity|max|86400000": 7,
                "batery_capacity|ma|21600000": 6.5,
                "batery_capacity|ma|86400000": 6.5,
                "batery_capacity|min|21600000": 6,
                "batery_capacity|min|86400000": 6,
                "batery_capacity|variance|21600000": 0.5,
                "batery_capacity|variance|86400000": 0.5,
                "consumer_totalizer": 4,
                "consumer_totalizer|max|21600000": 4,
                "consumer_totalizer|max|86400000": 4,
                "consumer_totalizer|ma|21600000": 3.5,
                "consumer_totalizer|ma|86400000": 3.5,
                "consumer_totalizer|min|21600000": 3,
                "consumer_totalizer|min|86400000": 3,
                "consumer_totalizer|variance|21600000": 0.5,
                "consumer_totalizer|variance|86400000": 0.5,
                "flow_rate_value": 1,
                "flow_rate_value|max|21600000": 1,
                "flow_rate_value|max|86400000": 1,
                "flow_rate_value|ma|21600000": 0.5,
                "flow_rate_value|ma|86400000": 0.5,
                "flow_rate_value|min|21600000": 0,
                "flow_rate_value|min|86400000": 0,
                "flow_rate_value|variance|21600000": 0.5,
                "flow_rate_value|variance|86400000": 0.5,
                "totalizer1": 2,
                "totalizer1|max|21600000": 2,
                "totalizer1|max|86400000": 2,
                "totalizer1|ma|21600000": 1.5,
                "totalizer1|ma|86400000": 1.5,
                "totalizer1|min|21600000": 1,
                "totalizer1|min|86400000": 1,
                "totalizer1|variance|21600000": 0.5,
                "totalizer1|variance|86400000": 0.5,
                "totalizer2": 3,
                "totalizer2|max|21600000": 3,
                "totalizer2|max|86400000": 3,
                "totalizer2|ma|21600000": 2.5,
                "totalizer2|ma|86400000": 2.5,
                "totalizer2|min|21600000": 2,
                "totalizer2|min|86400000": 2,
                "totalizer2|variance|21600000": 0.5,
                "totalizer2|variance|86400000": 0.5,
                "stampm": 1468493072000
            });
        });

        it ('duplicate insertions test', function() {
            snn.processRecord(JSON.parse('{"stampm": 1468493071, "carno": 0.0, "v": 1 }'));
            snn.processRecord(JSON.parse('{"stampm": 1468493072, "carno": 1.0, "v": 2 }'));
            assert.equal(snn.buffer.length, 3);
        });
    });
});