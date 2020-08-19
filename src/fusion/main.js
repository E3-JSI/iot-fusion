// main nrg-stream-fusion file

let configs = {
    "train": require('./conf/train.js'),
    "smartmeter_pc": require('./conf/smartmeter_pc.js'),
    "smartmeter_pg": require('./conf/smartmeter_pg.js'),
    "substation": require('./conf/substation.js'),
    "factory": require('./conf/factory.js')
}

module.exports = {
    streamFusion: require('./streamFusion.js'),
    incrementalLearning: require('./models/IncrementalLearning.js'),
    configs: configs
}