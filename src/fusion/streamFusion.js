/**
 * streamFusion
 * Main stream fusion class for heterogeneous sensor stream data fusion.
 */

// includes
const qm = require('qminer');
const fs = require('fs');
const streamingNode = require('./nodes/streamingNode.js');
const streamingEnergyNode = require('./nodes/streamingEnergyNode.js');
const streamingSubstationNode = require('./nodes/streamingSubstationNode.js');
const streamingTrainNode = require('./nodes/streamingTrainNode.js');
const streamingTimeValueNode = require('./nodes/streamingTimeValueNode.js');
const streamingSmartLampNode = require('./nodes/streamingSmartLampNode.js');
const streamingWeatherNode = require('./nodes/streamingWeatherNode.js');
const streamingStaticNode = require('./nodes/streamingStaticNode.js');
const streamModel = require ('./streamModel.js');
const { AbstractBroker, KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('../common/brokers/brokers.js');

class streamFusion {
    /**
     * constructor
     * @param {json} config         Configuration of the fusion component.
     * @param {json} aggrConfig     Configuration of stream aggregates.
     */
    constructor(connectionConfig, config, aggrConfigs) {
        // prepar self object for async function calls
        let self = this;

        // save the config
        this.config = JSON.parse(JSON.stringify(config));
        this.connectionConfig = JSON.parse(JSON.stringify(connectionConfig));

        // list of nodes
        this.nodes = [];
        // id of the master node
        this.masterNodeId = -1;
        // master node is up-to-date in the beginning
        this.masterSatisfied = true;
        // last feature vector  and its timestamp
        this.lastTimestamp = 0;
        this.lastFeatureVector = [];
        // have all nodes some data?
        this.allNodesAvailable = false;

        // get fusion model from config
        this.fusion_id = config.fusionModel;
        this.topic = "features_" + this.fusion_id;
        this.fusionTick = config.fusionTick;

        // construct DB path
        this.dbPath = "./db/" + this.fusion_id;

        // create qminer base
        // check if db exists
        if (!fs.existsSync('./db')) {
            fs.mkdirSync('./db');
        }

        // check if dpPath exists
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath);
        }

        // create base
        this.base = new qm.Base({ dbPath: this.dbPath, mode: 'createClean' });

        // create nodes (stores, stream aggregates)
        for (let nodeI in config.nodes) {
            // find the node config
            let nodeConfig = config.nodes[nodeI];
            nodeConfig.fusionTick = this.fusionTick;
            // detect master node
            if (nodeConfig.master == true) this.masterNodeId = nodeI;
            // create new node and save it to the list of nodes


            if (nodeConfig["type"] == "smartlamp") {
                this.nodes.push(new streamingSmartLampNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "timevalue") {
                this.nodes.push(new streamingTimeValueNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "substation") {
                this.nodes.push(new streamingSubstationNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "energy") {
                this.nodes.push(new streamingEnergyNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "train") {
                this.nodes.push(new streamingTrainNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "static") {
                this.nodes.push(new streamingStaticNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else if (nodeConfig["type"] == "weather") {
                this.nodes.push(new streamingWeatherNode(this.base, this.connectionConfig, nodeConfig, aggrConfigs, self.processRecordHook, nodeI, self));
            } else {
                console.log("ERROR: Streaming node type not found!");
            }
        }
        console.log("Created " + this.nodes.length + " nodes.");

        // create streaming model if needed
        if ("model" in config) {
            this.streamModel = new streamModel(config, self);
            // if model is included, than predictions will be sent
            this.topic = "predictions_" + this.fusion_id;
        }

        // connecting to Kafka
        if ("connection" in config) {
            if (config["connection"].type == "kafka") {
                this.broker = new KafkaNodeBroker(this.connectionConfig, this.topic, this.fusion_id);
                this.broker.addPublisher();
            } else if (config["connection"].type == "mqtt") {
                this.broker = new MQTTBroker(this.connectionConfig, this.topic, this.fusion_id);
                this.broker.addPublisher();
            } else {
                // fake broker
                this.broker = new AbstractBroker(this.connectionConfig, this.topic, this.fusion_id);
            }
        }

    }

    /**
     * processRecordHook
     * Main heartbeat function for data fusion, invoked with each received data.
     */
    processRecordHook(nodeI, self) {
        // always perform data fusion from the viewpoint of master node
        if (!self.allNodesAvailable) {
            // check if they are available
            for (let i in self.nodes) {
                if (self.nodes[i].buffer.length == 0) {
                    return null;
                }
            }
            self.allNodesAvailable = true;
        }

        if ((self.nodes[self.masterNodeId].buffer.length > 0) && (self.masterSatisfied == false)) {
            nodeI = self.masterNodeId;
        };

        // console.log("Process record initiated.");
        if (self.nodes[nodeI].isMaster() == true) {
            // try to build feature vector
            // set master offset
            self.nodes[nodeI].setMasterOffset();
            // get master 0 (zero) timestamp
            let zeroTimestamp = self.nodes[nodeI].getOffsetTimestamp();
            // transverse through the nodes, find appropriate offset and check
            // if data is available
            let dataAvailable = true;

            for (let nodeJ in self.nodes) {
                // check all non-slave nodes
                if (nodeJ != nodeI) {
                    // let's try to set slave offset
                    if (self.nodes[nodeJ].setSlaveOffset(zeroTimestamp)) {
                        // let's check, if other relevant offsets exist
                        if (!self.nodes[nodeJ].checkDataAvailability()) {
                            dataAvailable = false;
                        }
                    } else {
                        dataAvailable = false;
                    }
                }
            }
            // if it succeeds then build feature vector
            if ((dataAvailable) && (self.lastTimestamp != zeroTimestamp)) {
                self.masterSatisfied = true;
                // build feature vector
                let featureVector = self.buildFeatureVector();
                // TODO: optimize
                if ("model" in self.config) {
                    let prediction;
                    if (featureVector.length != 0) {
                        prediction = self.streamModel.updateStream(featureVector, zeroTimestamp);
                        self.broadcastPrediction(prediction[0], prediction[1], prediction[2]);
                    }
                } else {
                    // if there is no model included, than feature vector is broadcasted
                    self.broadcastFeatureVector(zeroTimestamp, featureVector);
                }
                self.lastTimestamp = zeroTimestamp;
                self.lastFeatureVector = featureVector;
                self.cleanupData();
            } else {
                console.log("Data not available.");
                self.masterSatisfied = false;
            }
        }
        // else if there is a measurement from non-master node
        else {
            // if master has not had it's feature vector built yet, now
            // may be the chance if all the data is available
            if (!self.masterSatisfied) {
                // TODO: try to build feature vector
            }
        }
    }


    /**
     * buildFeatureVector
     * Builds feature vector based on current offsets. Does NOT check
     * the offsets if they satisfy all conditions!
     */
    buildFeatureVector() {
        // create empty feature vector
        let featureVector = [];
        // get all partial feature vectors and merge them together
        for (let i in this.nodes) {
            let dataAvailable = this.nodes[i].checkDataAvailability();
            if (dataAvailable == false) {
                console.log("Can not be generated!");
                return [];
            }
            let partialFeatureVector = this.nodes[i].getPartialFeatureVector();
            featureVector = featureVector.concat(partialFeatureVector);
        }
        // return the feature vector
        return featureVector;
    }


    /**
     * broadcastFeatureVector
     * @param {long} timestamp          Unix timestamp.
     * @param {array} featureVector     Array of features.
     * Broadcasts full feature vector via appropriate broker.
     */
    broadcastFeatureVector(timestamp, featureVector) {
        let featureMessage = JSON.stringify({ timestamp: timestamp, ftr_vector: featureVector });
        if (featureVector != []) fs.appendFileSync("./data/" + this.fusion_id + ".json", featureMessage + "\n");
        this.broker.publish(featureMessage);
    }

    /**
     * broadcastPrediction
     * @param {long} timestamp          Unix timestamp.
     * @param {double} value            Prediction value.
     * @param {int} horizon             Prediction horizon in units of fusionTick.
     * Broadcasts predictions via appropriate broke.
     */
    broadcastPrediction(timestamp, value, horizon) {
        let featureMessage = { timestamp: timestamp, value: value, horizon: horizon };
        this.broker.publish(featureMessage);
    }

    /**
     * cleanupData
     * Delete all obsolete data rows in buffers.
     */
    cleanupData() {
        for (let i in this.nodes) {
            this.nodes[i].deleteObsoleteRows();
        }
    }

    /**
     * save
     * Saving the component.
     */
    save() {

    }


}

// expose class to the outside world
module.exports = streamFusion;
