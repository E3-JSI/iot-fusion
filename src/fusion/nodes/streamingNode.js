/**
 * streamingNode
 * Main streaming node class for heterogeneous sensor stream data fusion.
 * The component assumes all sensor data is coming with hourly time
 * granularity. Therefore no resampling has been implemented.
 */

// includes
const { KafkaNodeBroker, MQTTBroker, KafkaRDBroker } = require('../../common/brokers/brokers.js');

class streamingNode {
    /**
     * constructor
     * @param {qm.Base}  base               QMiner base.
     * @param {json}     config             Streaming node config.
     * @param {json}     aggrConfig         Configuration of stream aggregates.
     * @param {callback} porcessRecordCb    Callback for invoking data fusion.
     * @param {int}      fusionNodeI        Node id in fusion object.
     * @param {object}   parent             Pointer to parent (for processRecordCb).
     */
     constructor(base, connectionConfig, config,  aggrConfigs, processRecordCb, fusionNodeI, parent) {
        // inherit base from stream fusion component
        this.base = base;
        // create aggregate
        this.aggregate = {};
        // is this node master
        this.master = config.master;
        // remember config
        // attention: if we only pass config variable and this gets changed in main program, it will also change here
        // so we only save a copy (!), otherwise it is - apparently, a pointer
        this.config = JSON.parse(JSON.stringify(config));
        this.connectionConfig = JSON.parse(JSON.stringify(connectionConfig));
        this.topic = "measurements_node_" + this.config.nodeid;

        // remembering callback and fusionNodeId and parent object
        this.fusionNodeI = fusionNodeI;
        this.processRecordCb = processRecordCb;
        this.parent = parent;

        this.fusionTick = config.fusionTick;

        // extracting nodeid
        this.nodeId = config.nodeid;

        // creating empty buffer of partial feature vectors
        this.buffer = [];
        // current position within buffer
        this.position = 0;

        // To be done in specialized node: create stores for a particular node
        // To be done in specialized node: Connect to kafka consumer to a topic
    }

    /**
     * postConstructor
     * This function is called from specialized node and includes
     * common functions
     */
    postConstructor() {
        let self = this;
        if (this.parent != null) {
            if (this.parent.config.connection.type == "kafka") {
                this.broker = new KafkaNodeBroker(this.connectionConfig,
                    this.topic,
                    "client" + this.parent.fusion_id + this.nodeId);
                this.broker.addListener(self.processRecord.bind(self));
            } else if (this.parent.config.connection.type == "mqtt") {
                this.broker = new MQTTBroker(this.connectionConfig,
                    this.topic,
                    "client" + this.parent.fusion_id + this.nodeId);
                this.broker.addListener(self.processRecord.bind(self));
            } else {
                console.log("PROBLEM: No connection (OK for tests)!");
            }
        } else {
            console.log("PROBLEM: No parent defined. No connection (OK for tests).");
        }
    }

    /**
     * isMaster
     * Is this node master node?
     */
    isMaster() {
        return this.master;
    }

    /**
     * connectToKafka
     * Connecting to appropriate topic on Kafka.
     */
    connectToKafka() {
        console.log("Connecting to Kafka: " + this.topic);

        this.Consumer = kafka.Consumer;
        this.client = new kafka.Client(this.connectionConfig.zookeeper, this.id);
        this.offset = new kafka.Offset(this.client);
        let self = this;
        this.consumer = new this.Consumer(
            this.client,
            [ { topic: this.topic, partition: 0 }],
            { groupId: this.id }
        );

        this.consumer.on('message', function (message) {
            try {
                console.log("Message receieved.");
                let rec = JSON.parse(message.value);
                self.processRecord(rec);
            } catch (err) {
                console.log("ERROR", err);
            }
        });

        this.consumer.on('error', function (err) {
            console.log("Error", err);
        });

        // If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
        this.consumer.on('offsetOutOfRange', function (topic) {
            console.log(self.id, "outOfRange", topic);
            topic.maxNum = 2;
            self.offset.fetch([topic], function (err, offsets) {
                if (err) {
                    return console.error(err);
                }
                var min = Math.min(offsets[topic.topic][topic.partition]);
                console.log(self);
                self.consumer.setOffset(topic.topic, topic.partition, min);
            });
        });
    }

    /**
     * broadcastAggregates
     * @param {json} aggregates JSON encoded aggregate list.
     * Broadcast aggregates to an appropriate topic in Kafka.
     */
    broadcastAggregates(aggregates) {
        // TODO: Implement
        // console.log("broadcast aggregates from node (streamingNode)");
    }

    /**
     * setMasterOffset
     * Sets master buffer offset.
     */
    setMasterOffset() {
        this.position = (this.buffer.length - 1);
        // + this.config.attributes[i].time;
    }

    /**
     * getOffsetTimestamp
     * Returns timestamp at a particular offsetin the buffer.
     */
    getOffsetTimestamp() {
        // console.log("Positiion:", this.position);
        return this.buffer[this.position].stampm;
    }


    /**
     * setSlaveOffset
     * @param {long} zeroTimestamp  Zero timestamp for the master.
     */
    setSlaveOffset(zeroTimestamp) {
        // do we have any data, if not - then fail
        if (this.buffer.length == 0) {
            console.log("setSlaveIndex: there is no data - " + this.nodeId);
            return false;
        }

        // check the difference between last offset and zeroTimestamp in hours
        // get last offset
        let lastOffset = this.buffer.length - 1;
        // console.log("Last offset", lastOffset);
        // console.log("Buffer", this.buffer[0]);

        let lastTimestamp = this.buffer[lastOffset].stampm;
        // console.log("Zero TS", zeroTimestamp, "LastTS", lastTimestamp);

        // check difference
        let diffHours = (lastTimestamp - zeroTimestamp) / this.fusionTick;
        console.log("Fusion tick", this.fusionTick, "Diff ticks:", diffHours);

        // does this index exist
        let zeroIndex = lastOffset - diffHours;

        // check if index exists
        if (zeroIndex < 0) {
            console.log("setSlaveOffset: index does not exist (too small) - " + this.nodeId + "(" + zeroIndex + "/" + lastOffset + ")@" + this.parent.fusion_id);
            return false;
        } else if (zeroIndex > lastOffset) {
            console.log("setSlaveOffset: index does not exist (too big) - " + this.nodeId + "(" + zeroIndex + "/" + lastOffset + ")@" + this.parent.fusion_id);
            return false;
        } else if (zeroIndex != Math.floor(zeroIndex)) {
            console.log("setSlaveOffset: zeroIndex is not a whole number - " + zeroIndex);
        }

        console.log(zeroIndex);

        // is timestamp OK?
        if (this.buffer[zeroIndex].stampm != zeroTimestamp) {
            console.log("\n\nsetSlaveOffset: ERROR - timestamps DO NOT match!");
            console.log("\nNode: " + this.nodeId);
            console.log("\nZero index, last offset: " + zeroIndex + ", " + lastOffset);
            console.log("\nDifference (buffer - zero): " + this.buffer[zeroIndex].stampm + " - " + zeroTimestamp);
            console.log("\n\n\n");
        }

        // if we managed to come to here, then zero index is OK
        // we should remember it and return true
        this.position = zeroIndex;
        return true;

    }

    /**
     * checkDataAvailability
     * Checks if there is all the data available in the buffer for the current timestamp.
     */
    checkDataAvailability() {
        // TODO: how about timeDiffs (!)

        // inputs
        // this.buffer - current available data
        // this.position - current zero position in the data
        // this.config - configuration of data fusion parameters
        let dataAvailable = true;

        // find maximum negative offset
        this.maxNegativeOffset = 0;

        // transverse through all the attribute groups in the config
        for (let attrI in this.config.attributes) {
            let offset = this.config.attributes[attrI].time;

            if (offset < this.maxNegativeOffset) this.maxNegativeOffset = offset;

            // if data for one of the groups is not available, then
            // we have a problem
            if (!this.offsetExists(offset)) dataAvailable = false;
        }

        // return data availability
        return dataAvailable;
    }

    /**
     * offsetExists
     * @param {int} offsetInterval Offset interval to check in the current buffer.
     */
    offsetExists(offsetInterval) {
        // check if index exists
        let indexToCheck = this.position + offsetInterval;
        let lastOffset = this.buffer.length - 1;

        // do the check
        if (indexToCheck < 0) {
            console.log("offsetExists: index does not exist (too small) - " + this.nodeId + " - (" + indexToCheck + ")");
            return false;
        } else if (indexToCheck > lastOffset) {
            console.log("offsetExists: index does not exist (too big) - " + this.nodeId + this.nodeId + " - (" + indexToCheck + "/" + lastOffset + ")");
            return false;
        }

        // if we came to the end, we return true
        return true;
    }

    deleteObsoleteRows() {
        // calculate number of rows to delete
        let rowsToDelete = this.position + this.maxNegativeOffset - 5;
        console.log("Rows to delete (" + this.nodeId + ", " + this.parent.fusion_id + "): " + rowsToDelete + " / " + this.buffer.length);
        // remove rows
        for (let i = 1; i < rowsToDelete; i++) this.buffer.shift();
    }

    /**
     * createAggregates
     * @param {json} def    JSON definition of stream aggregates.
     */
    createAggregates(def) {
        // transverse all the fields in the definition
        for (let i in def) {
            // get field data
            let field = def[i];
            let fieldName = field["field"];
            let ticks = field["tick"];

            // create tick
            let aggregate = this.rawstore.addStreamAggr({
                "type": "timeSeriesTick",
                "timestamp": "Time",
                "value": fieldName
            });

            let tickName = fieldName + "|tick";
            this.aggregate[tickName] = aggregate;

            // handle tick sub aggregates
            for (let j in ticks) {
                let aggr = ticks[j];
                let type = aggr["type"];
                if (type == "ema") {
                    let interval = aggr["interval"];
                    let initWindow = aggr["initWindow"];
                    let aggregate = this.rawstore.addStreamAggr({
                        type: "ema",
                        inAggr: this.aggregate[tickName],
                        emaType: "previous",
                        interval: interval,
                        initWindow: initWindow
                    });
                    let emaName = fieldName + "|ema|" + interval;
                    this.aggregate[emaName] = aggregate;
                } else if (type == "winbuf") {
                    let winsize = aggr["winsize"];
                    let aggregate = this.rawstore.addStreamAggr({
                        type: "timeSeriesWinBufVector",
                        inAggr: this.aggregate[tickName],
                        winsize: winsize
                    });
                    let winBufName = fieldName + "|winbuf|" + winsize;
                    this.aggregate[winBufName] = aggregate;
                    // handle winbuf sub aggregates
                    let sub = aggr["sub"];
                    for (var k in sub) {
                        let subaggr = sub[k];
                        let subtype = subaggr["type"];
                        if (subtype == "variance") {
                            let aggregate = this.rawstore.addStreamAggr({
                                type: 'variance',
                                inAggr: this.aggregate[winBufName]
                            });
                            let varianceName = fieldName + "|variance|" + winsize;
                            this.aggregate[varianceName] = aggregate;
                        } else if (subtype == "ma") {
                            let aggregate = this.rawstore.addStreamAggr({
                                type: 'ma',
                                inAggr: this.aggregate[winBufName]
                            });
                            let maName = fieldName + "|ma|" + winsize;
                            this.aggregate[maName] = aggregate;
                        } else if (subtype == "min") {
                            let aggregate = this.rawstore.addStreamAggr({
                                type: 'winBufMin',
                                inAggr: this.aggregate[winBufName]
                            });
                            let minName = fieldName + "|min|" + winsize;
                            this.aggregate[minName] = aggregate;
                        } else if (subtype == "max") {
                            let aggregate = this.rawstore.addStreamAggr({
                                type: 'winBufMax',
                                inAggr: this.aggregate[winBufName]
                            });
                            let maxName = fieldName + "|max|" + winsize;
                            this.aggregate[maxName] = aggregate;
                        } // if subtype = *
                    } // for - sub aggregates of winbuf
                } // if type = "winbuf"
            } // for - ticks
        } // for - fields in aggregate definition
    } // createAggregates

    /**
     * getAggregates
     * Returns the vector of aggregates, excluding tick and winbuff.
     */
    getAggregates() {
        // create empty vector
        var aggrVector = {};
        // transverse through aggregates
        for (let key in this.aggregate) {
            // eliminate tick and winbuff
            if (!((key.indexOf("tick") > 0) || (key.indexOf("winbuf") > 0))) {
                // write value into the correct key
                aggrVector[key] = this.aggregate[key].getFloat();
                // all the timestamps should be the same
                aggrVector["stampm"] = this.aggregate[key].getTimestamp();
            };
        };
        return aggrVector;
    }

    /**
     * getPartialFeatureVector
     * Gets partial feature vector for a particular node.
     */
    getPartialFeatureVector() {
        // define feature vector
        let vec = [];

        for (let i in this.config.attributes) {
            let offset = this.position;
            // remember current time
            let currentTimestamp = this.buffer[offset]["stampm"];

            let attributes = this.config.attributes[i].attributes;

            // get time offset for current attribute family
            let timeOffset = this.config.attributes[i].time;
            offset = offset + timeOffset;

            // granularity is set this.fusionTick
            let expectedOffsetTimestamp = currentTimestamp + timeOffset * this.fusionTick;
            let trueOffsetTimestamp = this.buffer[offset]["stampm"];
            // find true offset
            if (expectedOffsetTimestamp != trueOffsetTimestamp) {
                while (trueOffsetTimestamp - expectedOffsetTimestamp < 0) {
                    // travel up, until reaching expected timestamp
                    offset++;
                    trueOffsetTimestamp = this.buffer[offset]["stampm"];
                }
                // did we overshoot? use previous value interopolation!
                if (trueOffsetTimestamp != expectedOffsetTimestamp) offset--;
            }

            for (let j in attributes) {
                let type = attributes[j].type; // value, timeDiff
                let attrName = attributes[j].name;

                if (type == "value") {
                    let value = this.buffer[offset][attrName];
                    vec.push(value);
                } else if (type == "timeDiff") {
                    let offset2 = offset - attributes[j].interval;
                    let value = this.buffer[offset2][attrName] - this.buffer[offset][attrName];
                    vec.push(value);
                }
            }
        }

        return vec;
    }
}

// expose classes to the outside world
module.exports = streamingNode;
