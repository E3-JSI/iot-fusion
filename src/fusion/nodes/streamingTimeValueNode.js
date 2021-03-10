/**
 * streamingTimeValueNode
 * Specialized streaming node for ingesting time-value pairs from a stream.
 */
const streamingNode = require('./streamingNode.js');
class streamingTimeValueNode extends streamingNode {
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
        this.storeName = this.nodeId.replace("-", "_");

        // creating empty buffer of partial feature vectors
        this.buffer = [];
        // current position within buffer
        this.position = 0;

        // adding store
        this.base.createStore({
            name: this.storeName,
            fields: [
                { name: "Time", type: "datetime" },
                { name: "value", type: "float" }
            ]
        });
        this.rawstore = this.base.store(this.storeName);

        this.lastValue = 0;
        this.lastTimestamp = 0;

        // create appropriate stream aggregates
        // with selected stream aggregates definition
        super.createAggregates(aggrConfigs[config.aggrConfigId]);
        // run super postConstructor
        super.postConstructor();
    }

    /**
     * processRecord()
     * @param {json} rec    Raw record from data source.
     */
    processRecord(rec) {
        // extract data
        if (typeof rec == "string") {
            rec = JSON.parse(rec);
        }

        let unixts = rec["time"] * 1000;
        let value = (isNaN(rec["value"]) || rec["value"] == null) ? 0 : rec["value"];

        if (unixts <= this.lastTimestamp) {
            console.log("TimeValue - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log(this.nodeId, "Timestamp is NaN!");
            return;
        }

        // do check timestamp if stream aggregates are calculated
        // if order is mixed - ignore (!)
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            value: value
        });

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);
        this.lastTimestamp = unixts;

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["value"] = value;

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingTimeValueNode;