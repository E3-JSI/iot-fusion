// const StreamFusion = require('nrg-stream-fusion').streamFusion;
const StreamFusion = require('./main.js').streamFusion;

// water config
let smConf = {
    "aggr": {
        "braila_pressure": [
            { "field": "value", "tick": [
                {"type": "winbuf", "winsize": 24 * 60 * 60 * 1000, "sub": [         // 24h sliding window
                    {"type": "ma" },
                    {"type": "max" },
                    {"type": "min" },
                    {"type": "variance" },
                ]}
            ]}
        ]
    },
    "fusion": {
        "fusionModel": "braila_pressure5771_10d",
        "connection": {
            "type": "kafka"
        },
        "fusionTick": 90 * 1000,
        "nodes": [
            {
                "type": "timevalue",
                "nodeid": "braila_pressure5771",
                "aggrConfigId": "braila_pressure",
                "master": true,
                "attributes": [
                    { "time": 0, "attributes": [
                        { type: "value", "name": "value" }
                    ]}, 
                    { "time": -1, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -2, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -3, "attributes": [
                        { type: "value", "name": "value|" }
                    ]},
                    { "time": -4, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -5, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -6, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -7, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -8, "attributes": [
                        { type: "value", "name": "value" }
                    ]},
                    { "time": -9, "attributes": [
                        { type: "value", "name": "value" }
                    ]}

                ]
            }
        ]
    }
};


// kafka connection config
let connectionConfig = {
    // kafka: "172.29.12.94:9092",
    kafka: "localhost:9092",
}

let brailaNodeid = ["braila_pressure5771",
     "braila_pressure5771",
     "braila_pressure5771",
     "braila_pressure5771"];

for (var i = 0; i < 4; i++){

    smConf["fusion"]["fusionModel"] = brailaNodeid[i] + '_10d';
    smConf["fusion"]["nodes"][0]["nodeid"] = brailaNodeid[i];

    const fusion = (new StreamFusion(connectionConfig, smConf["fusion"], smConf["aggr"]));
}
