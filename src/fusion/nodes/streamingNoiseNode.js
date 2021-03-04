/**
 * streamingSmartLampNode (template)
 * Streaming smart lamp node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingNoiseNode extends streamingNode {
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
                { name: "leak_state", type: "float" },
                { name: "noise_dB", type: "float" },
                { name: "spre_dB", type: "float" }
            ]
        });
        this.rawstore = this.base.store(this.storeName);

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

        if (typeof rec == "string") {
            rec = JSON.parse(rec);
        }

        // TODO: what if we used last-value interpolation instead of zero in the
        //       null?
        let unixts = rec["time"];
        let noise_dB = (isNaN(rec["noise_dB"]) || rec["noise_dB"] == null) ? 0 : rec["noise_dB"];
        let leak_state = (isNaN(rec["leak_state"]) || rec["leak_state"] == null) ? 0 : rec["leak_state"];
        let spre_dB = (isNaN(rec["spre_dB"]) || rec["spre_dB"] == null) ? 0 : rec["spre_dB"];

        if (unixts <= this.lastTimestamp) {
            console.log("Water - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log(this.nodeId, "Timestamp is NaN!");
            return;
        }

        // create ghost store record
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            noise_dB: noise_dB,
            leak_state: leak_state,
            spre_dB: spre_dB
        });

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);
        this.lastTimestamp = unixts;

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["noise_dB"] = noise_dB;
        combined["leak_state"] = leak_state;
        combined["spre_dB"] = spre_dB;

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingNoiseNode;