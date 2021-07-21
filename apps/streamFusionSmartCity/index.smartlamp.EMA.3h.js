/**
 * Main stream fusion example for smartmeters (Mlaka).
 */

// includes
const StreamFusion = require('nrg-stream-fusion').streamFusion;

// SMART-CITY CONFIG
let smConf = {
    "aggr": {
        "smartlamp": [
            { "field": "pact", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]},
            { "field": "dimml", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [     // 1d sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]}
        ]
    },
    "fusion": {                                                         // feature vector configuration
        "fusionModel": "ST0005-0000_3h",                                // name of the topic
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 60 * 60 * 1000,                                   // resampling on 60 min
        "model": {
            topic: "predictions_ST0005-0000",
            horizon: 3,
            label: 0,
            options: {
                method: "EMA",
                N: 5
            }
        },
        "nodes": [
            {
                "type": "smartlamp",
                "nodeid": "ST0005-0000",
                "aggrConfigId": "smartlamp",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [                                // current features
                        { type: "value", "name": "pact" },                      // first feature is also the predicted feature
                        { type: "value", "name": "pact|ma|86400000" },
                        { type: "value", "name": "dimml|ma|86400000" },
                    ]}
                ]
            }
        ]
    }
};

// kafka connection config
let connectionConfig = {
    kafka: "172.29.12.94:9092",
}

// initialize all the fusion scenarios
console.log("Initializing models for 3h prediction horizons - simple EMA");
console.log("ST0005-0000 to ST00005-0028");

let fusion = [];

function lZ(i) {
    if (i < 10) return "0" + i;
    return i;
}

// create 10 fusion models
for (let i = 0; i <= 28; i++) {
    connectionConfig.clientId = 'clientSubstation_' + Math.random().toString(16).substr(2, 8);

    /*
    // change weather feature according to time horizon
    let horizon = horizons[i];

    // handling changable weather features
    let features = ['temperature', 'humidity', 'pressure', 'windSpeed', 'windBearing', 'cloudCover' ];
    let attributes = [];

    for (let i in features) {
        let featureName = features[i] + horizon;
        attributes.push({type: "value", name: featureName});
    }
    smConf["fusion"]["nodes"][2]["attributes"]["attributes"] = attributes;
    */

    nodeId = "ST0005-00" + lZ(i);
    smConf["fusion"]["nodes"][0]["nodeid"] = nodeId;
    smConf["fusion"]["fusionModel"] = nodeId + "_3h";
    smConf["fusion"]["model"]["topic"] = "predictions_" + nodeId;

    fusion.push(new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
} //

// WATCHDOG CONFIG
const schedule = require('node-schedule');
const http = require('http');

const watchdog_ping = {
    url: "localhost",
    port: 3001,
    path: "/ping?id=12&secret=051de32597041e41f73b97d61c67a13b"
}

const watchdog_cron_schedule = '0 * * * * *'; // every 1 minute

// start scheduler
var j = schedule.scheduleJob(watchdog_cron_schedule, async () => {
    console.log("Checking into WatchDog");
    const options = {
        hostname: watchdog_ping.url, port: watchdog_ping.port,
        path: watchdog_ping.path, method: 'GET'
    }
    try {
        const req = http.request(options, res => {
            res.on('data', d => { /* nothing */ });
        });
        req.on('error', error => { console.error(error); })
        req.end()
    } catch(e) {
        console.log("WatchDog - check-in error", e);
    }
});
