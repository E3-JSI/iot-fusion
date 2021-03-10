/**
 * streamingDebitmeterNode (template)
 * Streaming noise node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingDebitmeterNode extends streamingNode {
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
                { name: "flow_rate_value", type: "float" },
                { name: "totalizer1", type: "float" },
                { name: "totalizer2", type: "float" },
                { name: "consumer_totalizer", type: "float" },
                { name: "analog_input1", type: "float" },
                { name: "analog_input2", type: "float" },
                { name: "batery_capacity", type: "float" },
                { name: "alarms_in_decimal", type: "float" }
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
        let unixts = rec["time"] * 1000;

        let flow_rate_value = (isNaN(rec["flow_rate_value"]) || rec["flow_rate_value"] == null) ? 0 : rec["flow_rate_value"];
        let totalizer1 = (isNaN(rec["totalizer1"]) || rec["totalizer1"] == null) ? 0 : rec["totalizer1"];
        let totalizer2 = (isNaN(rec["totalizer2"]) || rec["totalizer2"] == null) ? 0 : rec["totalizer2"];
        let consumer_totalizer = (isNaN(rec["consumer_totalizer"]) || rec["consumer_totalizer"] == null) ? 0 : rec["consumer_totalizer"];
        let analog_input1 = (isNaN(rec["analog_input1"]) || rec["analog_input1"] == null) ? 0 : rec["analog_input1"];
        let analog_input2 = (isNaN(rec["analog_input2"]) || rec["analog_input2"] == null) ? 0 : rec["analog_input2"];
        let batery_capacity = (isNaN(rec["batery_capacity"]) || rec["batery_capacity"] == null) ? 0 : rec["batery_capacity"];
        let alarms_in_decimal = (isNaN(rec["alarms_in_decimal"]) || rec["alarms_in_decimal"] == null) ? 0 : rec["alarms_in_decimal"];

        if (unixts <= this.lastTimestamp) {
            console.log("Debitmeter - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log(this.nodeId, "Timestamp is NaN!");
            return;
        }

        // create ghost store record
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            flow_rate_value: flow_rate_value,
            totalizer1: totalizer1,
            totalizer2: totalizer2,
            consumer_totalizer: consumer_totalizer,
            analog_input1: analog_input1,
            analog_input2: analog_input2,
            batery_capacity: batery_capacity,
            alarms_in_decimal: alarms_in_decimal
        });

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);
        this.lastTimestamp = unixts;

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["flow_rate_value"] = flow_rate_value;
        combined["totalizer1"] = totalizer1;
        combined["totalizer2"] = totalizer2;
        combined["consumer_totalizer"] = consumer_totalizer;
        combined["analog_input1"] = analog_input1;
        combined["analog_input2"] = analog_input2;
        combined["batery_capacity"] = batery_capacity;
        combined["alarms_in_decimal"] = alarms_in_decimal;

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingDebitmeterNode;