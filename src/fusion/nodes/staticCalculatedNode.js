/**
 * staticCalculatedNode
 * Node providing static data. Uses streamingNode interface, but does not acctually need a data stream.
 */
const streamingNode = require('./streamingNode.js');
class streamingAirQualityNode extends streamingNode {
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
        // call super constructor
        super(base, connectionConfig, config,  aggrConfigs, processRecordCb, fusionNodeI, parent);
        // remembering callback and fusionNodeId
        this.fusionNodeI = fusionNodeI;
        this.processRecordCb = processRecordCb;
        this.parent = parent;
        // remember nodeid name
        this.nodeId = config.nodeid;
        this.nodeFrequency = config.nodeFrequency !== undefined ? config.nodeFrequency : 3600000;

        // initialize last timestamp
        this.lastTimestamp = 0;

        // we do not run post constructor for this node since it does not connect to any
        // brokers
        // super.postConstructor();
    }

    /**
     * This node is always slave.
     */
    isMaster() {
        return false;
    }

    /**
     * Remember zero offset, no need to find it in the buffer since the features
     * are all calculated.
     *
     * @param {long} zeroTimestamp  Zero timestamp for the master.
     */
    setSlaveOffset(zeroTimestamp) {
        this.zeroTimestamp = zeroTimestamp;
        return true;
    }

    /**
     * checkDataAvailability
     * All the data is always available here.
     */
    checkDataAvailability() {
        return true;
    }

    /**
     * Nothing to do as we do not have rows in this node.
     */
    deleteObsoleteRows() {
        // do nothing
    }

    /**
     *
     */
    getPartialFeatureVector() {
        // define feature vector
        let vec = [];

        for (let i in this.config.attributes) {
            let attributes = this.config.attributes[i].attributes;

            // get time offset for current attribute family
            let offsetTime = this.config.attributes[i].time;
        }
    }

    /**
     * processRecord()
     * @param {json} rec    Raw record from data source.
     */
    processRecord(rec) {
        // this is not implemented
    }

}

module.exports = streamingAirQualityNode;