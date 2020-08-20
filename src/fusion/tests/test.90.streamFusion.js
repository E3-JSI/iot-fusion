const fileManager = require('../../common/utils/fileManager.js');
const StreamFusion = require('../streamFusion.js');
const qm = require('qminer');
const fs = require('fs');

// example of unit tests
var assert = require('assert');

// connectionConfig
let connectionConfig = {
    zookeeper: '192.168.85.98:2181'
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
        type: "none"
    },
    "fusionModel": "test",
    "fusionTick": 60 * 60 * 1000, // 1 hour
    "nodes": [
        {
            "type": "energy",
            "nodeid": "N1",
            "aggrConfigId": "energy",
            "fusionTick": 60 * 60 * 1000,
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

describe('streamFusion', function() {
    let fusion;

    before(function() {
        fileManager.removeFolder('./db/');
        fileManager.createFolder('./db/');
        // create base
        fusion = new StreamFusion(connectionConfig, fusionConfig, aggrConfigs);
    });

    after(function() {
    });

    describe('initialization', function() {
        it('base saved', function() {
            assert.equal(typeof fusion.base, "object");
        })

        it ('check number of fusion objects', function() {
            assert.equal(fusion.nodes.length, 3);
        });

        it ('check number of stores', function() {
            assert.equal(fusion.base.getStats().stores.length, 3);
        })

        it ('check fusion model name', function() {
            assert.equal(fusion.fusion_id, "test");
        })

        it ('check features topic name', function() {
            assert.equal(fusion.topic, "features_test");
        })

        it ('check types of nodes', function() {
            assert.equal(fusion.nodes[0].constructor.name, "streamingEnergyNode");
            assert.equal(fusion.nodes[1].constructor.name, "streamingStaticNode");
            assert.equal(fusion.nodes[2].constructor.name, "streamingWeatherNode");
        })

        it ('global config correct', function() {
            assert.deepEqual(fusion.config, fusionConfig);
        })

        it ('feature vector ok', function() {
            // fill in static
            let json = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');
            fusion.nodes[1].processRecord(json);
            for (let i = 1; i <= 24; i++) {
                json.timestamp = i * 60 * 60 * 1000;
                json.timeOfDay = i % 24;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.dayOfWeek = Math.floor(i / 24) + 2;
                json.dayOfMonth = Math.floor(i / 24) + 1;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.holiday = 1 - Math.floor(i / 24);
                fusion.nodes[1].processRecord(json);
            }

            // fill in weather
            let json_weather = JSON.parse('{"latitude":45.95472,"longitude":13.664836,"timezone":"Europe/Ljubljana","currently":{"time": 0},"hourly":{"data":[{"time":1388530800,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":41.68,"apparentTemperature":37.87,"dewPoint":36.19,"humidity":0.81,"pressure":1020.1,"windSpeed":5.82,"windBearing":92,"cloudCover":0.18,"uvIndex":0,"visibility":6.67},{"time":1388534400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.92,"apparentTemperature":39.92,"dewPoint":34.75,"humidity":0.82,"pressure":1019.69,"windSpeed":2.83,"windBearing":58,"cloudCover":0.42,"uvIndex":0,"visibility":6.18},{"time":1388538000,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.8,"apparentTemperature":36.94,"dewPoint":34.18,"humidity":0.8,"pressure":1019.3,"windSpeed":4.16,"windBearing":112,"cloudCover":0.18,"uvIndex":0,"visibility":7.03},{"time":1388541600,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.18,"apparentTemperature":33.08,"dewPoint":34.93,"humidity":0.85,"pressure":1019.3,"windSpeed":9,"windBearing":120,"cloudCover":0.18,"uvIndex":0,"visibility":7.03},{"time":1388545200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":36.02,"apparentTemperature":33.56,"dewPoint":31.67,"humidity":0.84,"pressure":1019.26,"windSpeed":3.25,"windBearing":239,"cloudCover":0.59,"uvIndex":0,"visibility":5.68},{"time":1388548800,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.28,"apparentTemperature":32.75,"dewPoint":34.94,"humidity":0.84,"pressure":1019.1,"windSpeed":10,"windBearing":120,"visibility":7.03},{"time":1388552400,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.88,"apparentTemperature":36.59,"dewPoint":35.76,"humidity":0.85,"pressure":1019,"windSpeed":4.68,"windBearing":120,"visibility":6.67},{"time":1388556000,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":35.13,"apparentTemperature":35.13,"dewPoint":32.58,"humidity":0.9,"pressure":1019.2,"windSpeed":0.14,"windBearing":156,"cloudCover":0.77,"uvIndex":0,"visibility":7.75},{"time":1388559600,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":40.62,"apparentTemperature":37.63,"dewPoint":35.66,"humidity":0.82,"pressure":1019,"windSpeed":4.46,"windBearing":123,"cloudCover":0.75,"uvIndex":0,"visibility":6.07},{"time":1388563200,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":42.14,"apparentTemperature":38.98,"dewPoint":36.87,"humidity":0.81,"pressure":1019.4,"windSpeed":5,"windBearing":130,"cloudCover":0.75,"uvIndex":0,"visibility":6.58},{"time":1388566800,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":40.49,"apparentTemperature":40.49,"dewPoint":35.13,"humidity":0.81,"pressure":1020.2,"windSpeed":1,"windBearing":110,"cloudCover":0.81,"uvIndex":0,"visibility":7.4},{"time":1388570400,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":44.84,"apparentTemperature":44.84,"dewPoint":38.35,"humidity":0.78,"pressure":1019.9,"windSpeed":1.41,"windBearing":286,"cloudCover":0.75,"uvIndex":1,"visibility":6.86},{"time":1388574000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":46.19,"apparentTemperature":46.19,"dewPoint":38.73,"humidity":0.75,"pressure":1019.8,"windSpeed":2.05,"windBearing":285,"cloudCover":0.75,"uvIndex":1,"visibility":6.86},{"time":1388577600,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":42.55,"apparentTemperature":42.55,"dewPoint":33.77,"humidity":0.71,"pressure":1019.54,"windSpeed":0.05,"windBearing":298,"cloudCover":0.63,"uvIndex":1,"visibility":8.59},{"time":1388581200,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":49.3,"apparentTemperature":49.3,"dewPoint":39.35,"humidity":0.68,"pressure":1019.1,"windSpeed":1.74,"windBearing":275,"cloudCover":0.31,"uvIndex":1,"visibility":7.06},{"time":1388584800,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":49.6,"apparentTemperature":49.6,"dewPoint":38.88,"humidity":0.66,"pressure":1019,"windSpeed":1.85,"windBearing":298,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388588400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":45.11,"apparentTemperature":45.11,"dewPoint":36.12,"humidity":0.71,"pressure":1019.19,"windSpeed":0.67,"windBearing":251,"cloudCover":0.43,"uvIndex":0,"visibility":7.96},{"time":1388592000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":43.54,"apparentTemperature":43.54,"dewPoint":37.19,"humidity":0.78,"pressure":1019.1,"windSpeed":2.07,"windBearing":290,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388595600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":43.2,"apparentTemperature":43.2,"dewPoint":37.15,"humidity":0.79,"pressure":1019.5,"windSpeed":2.33,"windBearing":106,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388599200,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.61,"apparentTemperature":39.61,"dewPoint":34.6,"humidity":0.82,"pressure":1020.04,"windSpeed":1.63,"windBearing":245,"cloudCover":0.67,"uvIndex":0,"visibility":8.75},{"time":1388602800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":44,"apparentTemperature":41.17,"dewPoint":37.74,"humidity":0.78,"pressure":1020.1,"windSpeed":5,"windBearing":120,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388606400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":42.88,"apparentTemperature":42.88,"dewPoint":36.9,"humidity":0.79,"pressure":1020.2,"windSpeed":2.06,"windBearing":113,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388610000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.4,"apparentTemperature":39.4,"dewPoint":34.86,"humidity":0.84,"pressure":1020.08,"windSpeed":2.14,"windBearing":103,"cloudCover":0.41,"uvIndex":0,"visibility":6.93},{"time":1388613600,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":40.51,"apparentTemperature":34.72,"dewPoint":35.38,"humidity":0.82,"pressure":1020,"windSpeed":9,"windBearing":130,"cloudCover":0.75,"uvIndex":0,"visibility":6.62},{"time":1388617200,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":39.89,"apparentTemperature":39.89,"dewPoint":34.98,"humidity":0.82,"pressure":1019.6,"windSpeed":2.71,"windBearing":116,"cloudCover":0.75,"uvIndex":0,"visibility":6.48},{"time":1388620800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":36.96,"apparentTemperature":36.96,"dewPoint":33.75,"humidity":0.88,"pressure":1019.3,"windSpeed":2.49,"windBearing":73,"cloudCover":0.59,"uvIndex":0,"visibility":6.09},{"time":1388624400,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":39.4,"apparentTemperature":36.52,"dewPoint":34.61,"humidity":0.83,"pressure":1018.9,"windSpeed":4.11,"windBearing":114,"cloudCover":0.75,"uvIndex":0,"visibility":6.3},{"time":1388628000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":37.85,"apparentTemperature":37.85,"dewPoint":34.01,"humidity":0.86,"pressure":1018.9,"windSpeed":2.92,"windBearing":107,"cloudCover":0.31,"uvIndex":0,"visibility":6.34},{"time":1388631600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":35.05,"apparentTemperature":35.05,"dewPoint":32.48,"humidity":0.9,"pressure":1018.39,"windSpeed":1.4,"windBearing":296,"cloudCover":0.52,"uvIndex":0,"visibility":6.32},{"time":1388635200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":36.47,"apparentTemperature":29.75,"dewPoint":32.5,"humidity":0.85,"pressure":1018.3,"windSpeed":9,"windBearing":120,"cloudCover":0.31,"uvIndex":0,"visibility":6.51},{"time":1388638800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":37.8,"apparentTemperature":34.52,"dewPoint":34.17,"humidity":0.87,"pressure":1018.1,"windSpeed":4.27,"windBearing":110,"cloudCover":0.31,"uvIndex":0,"visibility":6.67},{"time":1388642400,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":33.23,"apparentTemperature":33.23,"dewPoint":31.37,"humidity":0.93,"pressure":1017.83,"windSpeed":2.35,"windBearing":270,"cloudCover":0.83,"uvIndex":0,"visibility":8.43},{"time":1388646000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":38.84,"apparentTemperature":38.84,"dewPoint":35.21,"humidity":0.87,"pressure":1017.7,"windSpeed":2.61,"windBearing":66,"cloudCover":0.75,"uvIndex":0,"visibility":6.2},{"time":1388649600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":40.2,"apparentTemperature":40.2,"dewPoint":36.89,"humidity":0.88,"pressure":1018,"windSpeed":2.21,"windBearing":63,"cloudCover":1,"uvIndex":0,"visibility":6.2},{"time":1388653200,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":39.56,"apparentTemperature":34.03,"dewPoint":36.15,"humidity":0.87,"pressure":1017.72,"windSpeed":8.05,"windBearing":290,"cloudCover":0.89,"uvIndex":0,"visibility":7.1},{"time":1388656800,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.64,"apparentTemperature":44.64,"dewPoint":38,"humidity":0.77,"pressure":1017.7,"windSpeed":2.33,"windBearing":348,"cloudCover":1,"uvIndex":1,"visibility":6.2},{"time":1388660400,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":46.12,"apparentTemperature":46.12,"dewPoint":38.33,"humidity":0.74,"pressure":1017.3,"windSpeed":2.93,"windBearing":295,"cloudCover":1,"uvIndex":1,"visibility":6.03},{"time":1388664000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":41.53,"apparentTemperature":38.01,"dewPoint":34.68,"humidity":0.76,"pressure":1016.52,"windSpeed":5.36,"windBearing":273,"cloudCover":0.92,"uvIndex":1,"visibility":7.28},{"time":1388667600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":47.2,"apparentTemperature":45.03,"dewPoint":40.35,"humidity":0.77,"pressure":1016.2,"windSpeed":4.84,"windBearing":337,"cloudCover":1,"uvIndex":0,"visibility":5.48},{"time":1388671200,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.85,"apparentTemperature":43.76,"dewPoint":41.03,"humidity":0.83,"pressure":1016.2,"windSpeed":4.41,"windBearing":315,"cloudCover":1,"uvIndex":0,"visibility":5.48},{"time":1388674800,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":43.36,"apparentTemperature":40.46,"dewPoint":40.54,"humidity":0.9,"pressure":1016.57,"windSpeed":4.95,"windBearing":286,"cloudCover":0.86,"uvIndex":0,"visibility":4.73},{"time":1388678400,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.2,"apparentTemperature":41.97,"dewPoint":42.1,"humidity":0.92,"pressure":1016.4,"windSpeed":4.24,"windBearing":313,"cloudCover":1,"uvIndex":0,"visibility":4.91},{"time":1388682000,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.2,"apparentTemperature":44.2,"dewPoint":43.13,"humidity":0.96,"pressure":1016.6,"windSpeed":1.99,"windBearing":322,"cloudCover":1,"uvIndex":0,"visibility":4.4},{"time":1388685600,"summary":"Overcast","icon":"cloudy","precipIntensity":0,"precipProbability":0,"temperature":41.53,"apparentTemperature":41.53,"dewPoint":40.15,"humidity":0.95,"pressure":1016.82,"windSpeed":2.93,"windBearing":268,"cloudCover":0.94,"uvIndex":0,"visibility":4.83},{"time":1388689200,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.7,"apparentTemperature":45.7,"dewPoint":44.45,"humidity":0.95,"pressure":1016.7,"windSpeed":2,"windBearing":60,"cloudCover":1,"uvIndex":0,"visibility":4.6},{"time":1388692800,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.7,"apparentTemperature":45.7,"dewPoint":42.16,"humidity":0.87,"pressure":1017,"windSpeed":1.52,"windBearing":339,"cloudCover":1,"uvIndex":0,"visibility":4.5},{"time":1388696400,"summary":"Overcast","icon":"cloudy","precipIntensity":0,"precipProbability":0,"temperature":42.87,"apparentTemperature":42.87,"dewPoint":41.4,"humidity":0.94,"pressure":1017.27,"windSpeed":2.03,"windBearing":334,"cloudCover":1,"uvIndex":0,"visibility":4.19},{"time":1388700000,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.19,"apparentTemperature":45.19,"dewPoint":42.98,"humidity":0.92,"pressure":1017.3,"windSpeed":1.91,"windBearing":277,"cloudCover":1,"uvIndex":0,"visibility":2.89},{"time":1388703600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.45,"apparentTemperature":45.45,"dewPoint":43.01,"humidity":0.91,"pressure":1017.4,"windSpeed":2,"windBearing":254,"cloudCover":1,"uvIndex":0,"visibility":2.92}]}}');
            fusion.nodes[2].processRecord(json_weather);

            // energy node
            fusion.nodes[0].processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":3600000,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}'));

            fusion.nodes[0].setMasterOffset();
            fusion.nodes[1].setSlaveOffset(0);
            fusion.nodes[2].setSlaveOffset(0);
            assert.deepEqual(fusion.buildFeatureVector(), [
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                3,
                2,
                1,
                39.89,
                0.82,
                1019.6,
                2.71,
                116,
                0.75
            ]);
        });
    })
})

describe('streamFusion - extended', function() {
    let fusion;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        fusion = new StreamFusion(connectionConfig, fusionConfig, aggrConfigs)
    });

    after(function() {
    });

    describe('large data test', function() {
        it('handling large data node time offsets', function() {
            this.timeout(10000);
            // fill in static
            let json = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');
            fusion.nodes[1].processRecord(json);
            for (let i = 1; i <= 10024; i++) {
                json.timestamp = (-10000 + i) * 60 * 60 * 1000;
                json.timeOfDay = i % 24;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.dayOfWeek = Math.floor(i / 24) + 2;
                json.dayOfMonth = Math.floor(i / 24) + 1;
                json.dayOfYear = Math.floor(i / 24) + 1;
                json.holiday = 1 - Math.floor(i / 24);
                fusion.nodes[1].processRecord(json);
            }

            // fill in weather
            let json_weather = JSON.parse('{"latitude":45.95472,"longitude":13.664836,"timezone":"Europe/Ljubljana","currently":{"time": 0},"hourly":{"data":[{"time":1388530800,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":41.68,"apparentTemperature":37.87,"dewPoint":36.19,"humidity":0.81,"pressure":1020.1,"windSpeed":5.82,"windBearing":92,"cloudCover":0.18,"uvIndex":0,"visibility":6.67},{"time":1388534400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.92,"apparentTemperature":39.92,"dewPoint":34.75,"humidity":0.82,"pressure":1019.69,"windSpeed":2.83,"windBearing":58,"cloudCover":0.42,"uvIndex":0,"visibility":6.18},{"time":1388538000,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.8,"apparentTemperature":36.94,"dewPoint":34.18,"humidity":0.8,"pressure":1019.3,"windSpeed":4.16,"windBearing":112,"cloudCover":0.18,"uvIndex":0,"visibility":7.03},{"time":1388541600,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.18,"apparentTemperature":33.08,"dewPoint":34.93,"humidity":0.85,"pressure":1019.3,"windSpeed":9,"windBearing":120,"cloudCover":0.18,"uvIndex":0,"visibility":7.03},{"time":1388545200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":36.02,"apparentTemperature":33.56,"dewPoint":31.67,"humidity":0.84,"pressure":1019.26,"windSpeed":3.25,"windBearing":239,"cloudCover":0.59,"uvIndex":0,"visibility":5.68},{"time":1388548800,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.28,"apparentTemperature":32.75,"dewPoint":34.94,"humidity":0.84,"pressure":1019.1,"windSpeed":10,"windBearing":120,"visibility":7.03},{"time":1388552400,"summary":"Clear","icon":"clear-night","precipType":"rain","temperature":39.88,"apparentTemperature":36.59,"dewPoint":35.76,"humidity":0.85,"pressure":1019,"windSpeed":4.68,"windBearing":120,"visibility":6.67},{"time":1388556000,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":35.13,"apparentTemperature":35.13,"dewPoint":32.58,"humidity":0.9,"pressure":1019.2,"windSpeed":0.14,"windBearing":156,"cloudCover":0.77,"uvIndex":0,"visibility":7.75},{"time":1388559600,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":40.62,"apparentTemperature":37.63,"dewPoint":35.66,"humidity":0.82,"pressure":1019,"windSpeed":4.46,"windBearing":123,"cloudCover":0.75,"uvIndex":0,"visibility":6.07},{"time":1388563200,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":42.14,"apparentTemperature":38.98,"dewPoint":36.87,"humidity":0.81,"pressure":1019.4,"windSpeed":5,"windBearing":130,"cloudCover":0.75,"uvIndex":0,"visibility":6.58},{"time":1388566800,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":40.49,"apparentTemperature":40.49,"dewPoint":35.13,"humidity":0.81,"pressure":1020.2,"windSpeed":1,"windBearing":110,"cloudCover":0.81,"uvIndex":0,"visibility":7.4},{"time":1388570400,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":44.84,"apparentTemperature":44.84,"dewPoint":38.35,"humidity":0.78,"pressure":1019.9,"windSpeed":1.41,"windBearing":286,"cloudCover":0.75,"uvIndex":1,"visibility":6.86},{"time":1388574000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":46.19,"apparentTemperature":46.19,"dewPoint":38.73,"humidity":0.75,"pressure":1019.8,"windSpeed":2.05,"windBearing":285,"cloudCover":0.75,"uvIndex":1,"visibility":6.86},{"time":1388577600,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":42.55,"apparentTemperature":42.55,"dewPoint":33.77,"humidity":0.71,"pressure":1019.54,"windSpeed":0.05,"windBearing":298,"cloudCover":0.63,"uvIndex":1,"visibility":8.59},{"time":1388581200,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":49.3,"apparentTemperature":49.3,"dewPoint":39.35,"humidity":0.68,"pressure":1019.1,"windSpeed":1.74,"windBearing":275,"cloudCover":0.31,"uvIndex":1,"visibility":7.06},{"time":1388584800,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":49.6,"apparentTemperature":49.6,"dewPoint":38.88,"humidity":0.66,"pressure":1019,"windSpeed":1.85,"windBearing":298,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388588400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":45.11,"apparentTemperature":45.11,"dewPoint":36.12,"humidity":0.71,"pressure":1019.19,"windSpeed":0.67,"windBearing":251,"cloudCover":0.43,"uvIndex":0,"visibility":7.96},{"time":1388592000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":43.54,"apparentTemperature":43.54,"dewPoint":37.19,"humidity":0.78,"pressure":1019.1,"windSpeed":2.07,"windBearing":290,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388595600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":43.2,"apparentTemperature":43.2,"dewPoint":37.15,"humidity":0.79,"pressure":1019.5,"windSpeed":2.33,"windBearing":106,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388599200,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.61,"apparentTemperature":39.61,"dewPoint":34.6,"humidity":0.82,"pressure":1020.04,"windSpeed":1.63,"windBearing":245,"cloudCover":0.67,"uvIndex":0,"visibility":8.75},{"time":1388602800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":44,"apparentTemperature":41.17,"dewPoint":37.74,"humidity":0.78,"pressure":1020.1,"windSpeed":5,"windBearing":120,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388606400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":42.88,"apparentTemperature":42.88,"dewPoint":36.9,"humidity":0.79,"pressure":1020.2,"windSpeed":2.06,"windBearing":113,"cloudCover":0.31,"uvIndex":0,"visibility":7.19},{"time":1388610000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":39.4,"apparentTemperature":39.4,"dewPoint":34.86,"humidity":0.84,"pressure":1020.08,"windSpeed":2.14,"windBearing":103,"cloudCover":0.41,"uvIndex":0,"visibility":6.93},{"time":1388613600,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":40.51,"apparentTemperature":34.72,"dewPoint":35.38,"humidity":0.82,"pressure":1020,"windSpeed":9,"windBearing":130,"cloudCover":0.75,"uvIndex":0,"visibility":6.62},{"time":1388617200,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":39.89,"apparentTemperature":39.89,"dewPoint":34.98,"humidity":0.82,"pressure":1019.6,"windSpeed":2.71,"windBearing":116,"cloudCover":0.75,"uvIndex":0,"visibility":6.48},{"time":1388620800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":36.96,"apparentTemperature":36.96,"dewPoint":33.75,"humidity":0.88,"pressure":1019.3,"windSpeed":2.49,"windBearing":73,"cloudCover":0.59,"uvIndex":0,"visibility":6.09},{"time":1388624400,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":39.4,"apparentTemperature":36.52,"dewPoint":34.61,"humidity":0.83,"pressure":1018.9,"windSpeed":4.11,"windBearing":114,"cloudCover":0.75,"uvIndex":0,"visibility":6.3},{"time":1388628000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":37.85,"apparentTemperature":37.85,"dewPoint":34.01,"humidity":0.86,"pressure":1018.9,"windSpeed":2.92,"windBearing":107,"cloudCover":0.31,"uvIndex":0,"visibility":6.34},{"time":1388631600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":35.05,"apparentTemperature":35.05,"dewPoint":32.48,"humidity":0.9,"pressure":1018.39,"windSpeed":1.4,"windBearing":296,"cloudCover":0.52,"uvIndex":0,"visibility":6.32},{"time":1388635200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":36.47,"apparentTemperature":29.75,"dewPoint":32.5,"humidity":0.85,"pressure":1018.3,"windSpeed":9,"windBearing":120,"cloudCover":0.31,"uvIndex":0,"visibility":6.51},{"time":1388638800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipType":"rain","temperature":37.8,"apparentTemperature":34.52,"dewPoint":34.17,"humidity":0.87,"pressure":1018.1,"windSpeed":4.27,"windBearing":110,"cloudCover":0.31,"uvIndex":0,"visibility":6.67},{"time":1388642400,"summary":"Mostly Cloudy","icon":"partly-cloudy-night","precipIntensity":0,"precipProbability":0,"temperature":33.23,"apparentTemperature":33.23,"dewPoint":31.37,"humidity":0.93,"pressure":1017.83,"windSpeed":2.35,"windBearing":270,"cloudCover":0.83,"uvIndex":0,"visibility":8.43},{"time":1388646000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipType":"rain","temperature":38.84,"apparentTemperature":38.84,"dewPoint":35.21,"humidity":0.87,"pressure":1017.7,"windSpeed":2.61,"windBearing":66,"cloudCover":0.75,"uvIndex":0,"visibility":6.2},{"time":1388649600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":40.2,"apparentTemperature":40.2,"dewPoint":36.89,"humidity":0.88,"pressure":1018,"windSpeed":2.21,"windBearing":63,"cloudCover":1,"uvIndex":0,"visibility":6.2},{"time":1388653200,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":39.56,"apparentTemperature":34.03,"dewPoint":36.15,"humidity":0.87,"pressure":1017.72,"windSpeed":8.05,"windBearing":290,"cloudCover":0.89,"uvIndex":0,"visibility":7.1},{"time":1388656800,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.64,"apparentTemperature":44.64,"dewPoint":38,"humidity":0.77,"pressure":1017.7,"windSpeed":2.33,"windBearing":348,"cloudCover":1,"uvIndex":1,"visibility":6.2},{"time":1388660400,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":46.12,"apparentTemperature":46.12,"dewPoint":38.33,"humidity":0.74,"pressure":1017.3,"windSpeed":2.93,"windBearing":295,"cloudCover":1,"uvIndex":1,"visibility":6.03},{"time":1388664000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":41.53,"apparentTemperature":38.01,"dewPoint":34.68,"humidity":0.76,"pressure":1016.52,"windSpeed":5.36,"windBearing":273,"cloudCover":0.92,"uvIndex":1,"visibility":7.28},{"time":1388667600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":47.2,"apparentTemperature":45.03,"dewPoint":40.35,"humidity":0.77,"pressure":1016.2,"windSpeed":4.84,"windBearing":337,"cloudCover":1,"uvIndex":0,"visibility":5.48},{"time":1388671200,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.85,"apparentTemperature":43.76,"dewPoint":41.03,"humidity":0.83,"pressure":1016.2,"windSpeed":4.41,"windBearing":315,"cloudCover":1,"uvIndex":0,"visibility":5.48},{"time":1388674800,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":43.36,"apparentTemperature":40.46,"dewPoint":40.54,"humidity":0.9,"pressure":1016.57,"windSpeed":4.95,"windBearing":286,"cloudCover":0.86,"uvIndex":0,"visibility":4.73},{"time":1388678400,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.2,"apparentTemperature":41.97,"dewPoint":42.1,"humidity":0.92,"pressure":1016.4,"windSpeed":4.24,"windBearing":313,"cloudCover":1,"uvIndex":0,"visibility":4.91},{"time":1388682000,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":44.2,"apparentTemperature":44.2,"dewPoint":43.13,"humidity":0.96,"pressure":1016.6,"windSpeed":1.99,"windBearing":322,"cloudCover":1,"uvIndex":0,"visibility":4.4},{"time":1388685600,"summary":"Overcast","icon":"cloudy","precipIntensity":0,"precipProbability":0,"temperature":41.53,"apparentTemperature":41.53,"dewPoint":40.15,"humidity":0.95,"pressure":1016.82,"windSpeed":2.93,"windBearing":268,"cloudCover":0.94,"uvIndex":0,"visibility":4.83},{"time":1388689200,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.7,"apparentTemperature":45.7,"dewPoint":44.45,"humidity":0.95,"pressure":1016.7,"windSpeed":2,"windBearing":60,"cloudCover":1,"uvIndex":0,"visibility":4.6},{"time":1388692800,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.7,"apparentTemperature":45.7,"dewPoint":42.16,"humidity":0.87,"pressure":1017,"windSpeed":1.52,"windBearing":339,"cloudCover":1,"uvIndex":0,"visibility":4.5},{"time":1388696400,"summary":"Overcast","icon":"cloudy","precipIntensity":0,"precipProbability":0,"temperature":42.87,"apparentTemperature":42.87,"dewPoint":41.4,"humidity":0.94,"pressure":1017.27,"windSpeed":2.03,"windBearing":334,"cloudCover":1,"uvIndex":0,"visibility":4.19},{"time":1388700000,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.19,"apparentTemperature":45.19,"dewPoint":42.98,"humidity":0.92,"pressure":1017.3,"windSpeed":1.91,"windBearing":277,"cloudCover":1,"uvIndex":0,"visibility":2.89},{"time":1388703600,"summary":"Overcast","icon":"cloudy","precipType":"rain","temperature":45.45,"apparentTemperature":45.45,"dewPoint":43.01,"humidity":0.91,"pressure":1017.4,"windSpeed":2,"windBearing":254,"cloudCover":1,"uvIndex":0,"visibility":2.92}]}}');
            fusion.nodes[2].processRecord(json_weather);

            // energy node
            fusion.nodes[0].processRecord(JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":0,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}'));

            fusion.processRecordHook(0, fusion);

            assert.deepEqual(fusion.buildFeatureVector(), [
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                6000,
                0,
                0,
                0,
                16,
                0,
                -416,
                0,
                1,
                419,
                418,
                1,
                39.89,
                0.82,
                1019.6,
                2.71,
                116,
                0.75
            ]);
            fusion.cleanupData();
            assert.equal(fusion.nodes[1].buffer.length, 31);
        });
    });
});


// testing out of order


// basic aggregate config
let aggrConfigsMix = {
    "energy": [
        { "field": "pc", "tick": [
            { "type": "winbuf", "winsize": 1 * 60 * 60 * 1000, "sub": [
                { "type": "ma" },
            ]},
            { "type": "winbuf", "winsize": 30 * 24 * 60 * 60 * 1000, "sub": [
                { "type": "ma" },
            ]}
        ]}
    ],
    "static": []
};

// basic fusion config
// for testing reasons we are overriding fusionTick, which is in each node
// otherwise inherited from fusionConfig
let fusionConfigMix = {
    "connection": {
        type: "none"
    },
    "fusionModel": "test",
    "fusionTick": 60 * 60 * 1000, // 1 hour
    "nodes": [
        {
            "type": "energy",
            "nodeid": "N1mix",
            "aggrConfigId": "energy",
            "fusionTick": 60 * 60 * 1000,
            "master": true,
            "attributes": [
                { "time": 0, "attributes": [                        // current time
                    { type: "value", "name": "pc" },
                ]}
            ]
        },
        {
            "type": "static",
            "nodeid": "staticmix",
            "aggrConfigId": "static",
            "fusionTick": 60 * 60 * 1000, // 1 hour
            "master": false,
            "attributes": [
                { "time": 0, "attributes": [
                    { type: "value", "name": "timeOfDay" },
                ]}
            ]
        }
    ]
}


describe('stream fusion - out of order',  function() {
    let fusion;

    before(function() {
        fileManager.removeFolder('./db2/');
        fileManager.createFolder('./db2/');
        // create base
        fusion = new StreamFusion(connectionConfig, fusionConfigMix, aggrConfigsMix)
    });

    after(function() {
    });

    it('filling in static nodes first', function() {
        // energy node
        let jsonNode = JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":0,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}');
        // static
        jsonStatic = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');

        // results
        let results = [];

        // fill in static data
        for (let i = 1; i <= 24; i++) {
            jsonStatic.timestamp = i * 60 * 60 * 1000; // this one is in miliseconds
            jsonStatic.timeOfDay = i % 24;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.dayOfWeek = Math.floor(i / 24) + 2;
            jsonStatic.dayOfMonth = Math.floor(i / 24) + 1;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.holiday = 1 - Math.floor(i / 24);
            fusion.nodes[1].processRecord(jsonStatic);
            results.push(fusion.lastFeatureVector);
        }

        // fill in nodes
        for (let i = 1; i <= 24; i++) {
            jsonNode["stamp"] = i * 60 * 60;  // this one is in seconds
            jsonNode.pc = i;
            fusion.nodes[0].processRecord(jsonNode);
            results.push(fusion.lastFeatureVector);
        }

        let expectedResults = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [ 1, 1 ],
            [ 2, 2 ],
            [ 3, 3 ],
            [ 4, 4 ],
            [ 5, 5 ],
            [ 6, 6 ],
            [ 7, 7 ],
            [ 8, 8 ],
            [ 9, 9 ],
            [ 10, 10 ],
            [ 11, 11 ],
            [ 12, 12 ],
            [ 13, 13 ],
            [ 14, 14 ],
            [ 15, 15 ],
            [ 16, 16 ],
            [ 17, 17 ],
            [ 18, 18 ],
            [ 19, 19 ],
            [ 20, 20 ],
            [ 21, 21 ],
            [ 22, 22 ],
            [ 23, 23 ],
            [ 24, 0 ]
        ];

        assert.deepEqual(results, expectedResults);
    });

    it('correctly identifying master node', function() {
        assert.equal(0, fusion.masterNodeId);
    })

    it('filling in energy nodes first', function() {
        // energy node
        let jsonNode = JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":0,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}');
        // static
        jsonStatic = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');

        // results
        let results = [];

        // look for the last timestamp of a feature vector
        let lastTimestamp = fusion.lastTimestamp;

        // fill in nodes
        for (let i = 25; i <= 48; i++) {
            jsonNode["stamp"] = i * 60 * 60;  // this one is in seconds
            jsonNode.pc = i;
            fusion.nodes[0].processRecord(jsonNode);
            if (fusion.lastTimestamp > lastTimestamp) {
                lastTimestamp = fusion.lastTimestamp;
                results.push(fusion.lastFeatureVector);
            }
        }

        // fill in static data
        for (let i = 25; i <= 48; i++) {
            jsonStatic.timestamp = i * 60 * 60 * 1000; // this one is in miliseconds
            jsonStatic.timeOfDay = i % 24;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.dayOfWeek = Math.floor(i / 24) + 2;
            jsonStatic.dayOfMonth = Math.floor(i / 24) + 1;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.holiday = 1 - Math.floor(i / 24);
            fusion.nodes[1].processRecord(jsonStatic);
            if (fusion.lastTimestamp > lastTimestamp) {
                lastTimestamp = fusion.lastTimestamp;
                results.push(fusion.lastFeatureVector);
            }
        }


        let expectedResults = [
            [ 48, 0 ]
        ];

        assert.deepEqual(results, expectedResults);
    });

    it('one step filling in slave first and master later', function() {
        // energy node
        let jsonNode = JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":0,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}');
        // static
        jsonStatic = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');

        // results
        let results = [];

        // look for the last timestamp of a feature vector
        let lastTimestamp = fusion.lastTimestamp;

        // fill in nodes
        for (let i = 49; i <= 72; i++) {
            jsonNode["stamp"] = i * 60 * 60;  // this one is in seconds
            jsonNode.pc = i;
            fusion.nodes[0].processRecord(jsonNode);
            if (fusion.lastTimestamp > lastTimestamp) {
                lastTimestamp = fusion.lastTimestamp;
                results.push(fusion.lastFeatureVector);
            }

            jsonStatic.timestamp = i * 60 * 60 * 1000; // this one is in miliseconds
            jsonStatic.timeOfDay = i % 24;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.dayOfWeek = Math.floor(i / 24) + 2;
            jsonStatic.dayOfMonth = Math.floor(i / 24) + 1;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.holiday = 1 - Math.floor(i / 24);
            fusion.nodes[1].processRecord(jsonStatic);
            if (fusion.lastTimestamp > lastTimestamp) {
                lastTimestamp = fusion.lastTimestamp;
                results.push(fusion.lastFeatureVector);
            }
        }

        let expectedResults = [
            [ 49, 1 ],
            [ 50, 2 ],
            [ 51, 3 ],
            [ 52, 4 ],
            [ 53, 5 ],
            [ 54, 6 ],
            [ 55, 7 ],
            [ 56, 8 ],
            [ 57, 9 ],
            [ 58, 10 ],
            [ 59, 11 ],
            [ 60, 12 ],
            [ 61, 13 ],
            [ 62, 14 ],
            [ 63, 15 ],
            [ 64, 16 ],
            [ 65, 17 ],
            [ 66, 18 ],
            [ 67, 19 ],
            [ 68, 20 ],
            [ 69, 21 ],
            [ 70, 22 ],
            [ 71, 23 ],
            [ 72, 0 ]
        ];


        assert.deepEqual(results, expectedResults);
        // console.log(results);
    });


    /*
    it('out of order measurements', function() {
        // energy node
        let jsonNode = JSON.parse('{"_id":"5707556a50b3b92656fc2ceb","node_id":"1038","stamp":0,"stamp_db":1460098410,"v1":232.45,"v2":232.03,"v3":231.15,"i1":0.92,"i2":1.25,"i3":1.2,"pc":6000,"pg":0,"qc":0,"qg":0}');
        // static
        jsonStatic = JSON.parse('{"timestamp":0, "timeOfDay": 0, "dayAfterHoliday": 0, "dayBeforeHoliday": 1, "dayOfYear": 1, "dayOfWeek": 2, "dayOfMonth": 1, "holiday": 1, "monthOfYear": 1, "weekEnd": 0 }');

        // fill in nodes
        for (let i = 25; i <= 48; i++) {
            jsonNode["stamp"] = i * 60 * 60;  // this one is in seconds
            jsonNode.pc = i;
            fusion.nodes[0].processRecord(jsonNode);
        }

        // fill in static data
        for (let i = 25; i <= 48; i++) {
            jsonStatic.timestamp = i * 60 * 60 * 1000; // this one is in miliseconds
            jsonStatic.timeOfDay = i % 24;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.dayOfWeek = Math.floor(i / 24) + 2;
            jsonStatic.dayOfMonth = Math.floor(i / 24) + 1;
            jsonStatic.dayOfYear = Math.floor(i / 24) + 1;
            jsonStatic.holiday = 1 - Math.floor(i / 24);
            fusion.nodes[1].processRecord(jsonStatic);
        }
    });
    */

});