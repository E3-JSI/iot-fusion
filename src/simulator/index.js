// imports
const fs = require('fs');
const Simulator = require("./simulator");

// read input parameters
let configFile = "config_NAIADES_braila.json";

// read config
let rawConfig = fs.readFileSync(configFile);
let config = JSON.parse(rawConfig);

// start simulator
let simulator = new Simulator(config);