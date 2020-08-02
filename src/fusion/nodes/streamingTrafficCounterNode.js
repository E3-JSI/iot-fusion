/**
 * streamingSmartLampNode (template)
 * Streaming smart lamp node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingTrafficCounterNode extends streamingNode {
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

        // creating empty buffer of partial feature vectors
        this.buffer = [];
        // current position within buffer
        this.position = 0;

        // adding store
        this.base.createStore({
            name: this.nodeId,
            fields: [
                { name: "Time", type: "datetime" },
                { name: "carno", type: "float" },
                { name: "v", type: "float" }
            ]
        });
        this.rawstore = this.base.store(this.nodeId);

        // initialize last timestamp
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
        // extract record from rec (according to the store construction)
        let record = {};

        // TODO: what if we used last-value interpolation instead of zero in the
        //       null?
        let unixts = rec["stampm"];
        let carno = (isNaN(rec["carno"]) || rec["carno"] == null) ? 0 : rec["carno"];
        let v = (isNaN(rec["v"]) || rec["v"] == null) ? 0 : rec["v"];

        if (unixts <= this.lastTimestamp) {
            console.log("Smart Lamp - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log("Timestamp is NaN!");
            return;
        }

        // create ghost store record
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            carno: carno,
            v: v
        });

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);
        this.lastTimestamp = unixts;

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["carno"] = carno;
        combined["v"] = v;

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingTrafficCounterNode;