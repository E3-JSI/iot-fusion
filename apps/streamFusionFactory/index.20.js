/**
 * Stream fusion component for substations (In2Dreams).
 */

// AZOT CONFIG
let smConf = {
    "aggr": {
        "timevalue": [
            { "field": "value", "tick": [
                { "type": "winbuf", "winsize": 6 * 60 * 60 * 1000, "sub": [         // 6h sliding window
                    { "type": "ma" },
                    { "type": "max" },
                    { "type": "min" },
                    { "type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]},
                {"type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [     // 1w sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]}
        ],
        "static": [
            { "field": "holiday", "tick": [
                { "type": "winbuf", "winsize": 7 * 24 * 60 * 60 * 1000, "sub": [
                    { "type": "ma" }
                ]}
            ]}
        ]
    },
    "fusion": {                                                         // feature vector configuration
        "fusionModel": "N1_24h",                                        // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "nodes": [
            {
                "type": "timevalue",
                "nodeid": "N1",
                "aggrConfigId": "timevalue",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "value" },                     // first feature is also the predicted feature

                        { type: "value", "name": "value|ma|21600000" },         // 6h aggregate
                        { type: "value", "name": "value|min|21600000" },
                        { type: "value", "name": "value|max|21600000" },
                        { type: "value", "name": "value|variance|21600000" },

                        { type: "value", "name": "value|ma|86400000" },         // 1d aggregate
                        { type: "value", "name": "value|min|86400000" },
                        { type: "value", "name": "value|max|86400000" },
                        { type: "value", "name": "value|variance|86400000" },
                    ]},
                    { "time": -24, "attributes": [                              // 1d ago
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -7 * 24, "attributes": [                          // 1w ago
                        { type: "value", "name": "value" }
                    ]}
                ]
            },
            {
                "type": "static",
                "nodeid": "S1",
                "aggrConfigId": "static",
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
            }
        ]
    }
};

// connectionConfig
let connectionConfig = {
    kafka: "192.168.82.187:9092",
    zookeeper: "192.168.82.187:2181",
}

let horizons = [12, 24, 36];

const watchdog_ping = {
    url: "localhost",
    port: 3001,
    path: "/ping?id=4&secret=051de32597041e41f73b97d61c67a13b"
}

const watchdog_cron_schedule = '0 * * * * *'; // every 1 minute

// END OF CONFIGURATION STRUCTURES ----------------------------------------------

// includes
const StreamFusion = require("nrg-stream-fusion").streamFusion;
const schedule = require('node-schedule');
const http = require('http');

// initialize all the fusion scenarios
let fusion = [];

// set start and end from commandline
let start = 0;
let end = 0;

// set start and end from commandline
if (process.argv[2] != "") start = parseInt(process.argv[2]);
if (process.argv[3] != "") end = parseInt(process.argv[3]);

// create 20 different models
for (let j = 1; j <= 20; j++) {
    // create (end - start) models for different horizons
    for (let i = start; i <= end; i++) {
        connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 8);

        // change weather feature according to time horizon
        let horizon = horizons[i];

        // shifting DT features
        smConf["fusion"]["nodes"][1]["attributes"][0]["time"] = horizon;

        // renaming model
        smConf["fusion"]["fusionModel"] = "N" + j + "_" + horizon + "h";
        smConf["fusion"]["nodes"][0]["nodeid"] = "N" + j;

        // adding fusion model
        fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
    }
}

// WATCHDOG

// start scheduler
var j = schedule.scheduleJob(watchdog_cron_schedule, async () => {
    console.log("Checking into WatchDog");

    const options = {
      hostname: watchdog_ping.url,
      port: watchdog_ping.port,
      path: watchdog_ping.path,
      method: 'GET'
    }

    const req = http.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`)

      res.on('data', d => {
        // process.stdout.write(d)
      })
    })

    req.on('error', error => {
      console.error(error)
    })

    req.end()
});