/**
 * streamingSpecialNode (template)
 * Specialized streaming node template class for heterogeneous sensor stream data fusion.
 */
class streamingSpecialNode extends streamingNode {
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
        // TODO: create appropriate store

        // create appropriate stream aggregates
        // with selected stream aggregates definition
        console.log("Special: " + aggrConfigs[config.aggrConfigId]);
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

        // do check timestamp if stream aggregates are calculated
        // if order is mixed - ignore (!)
        this.rawRecord = this.rawstore.newRecord(record);

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // combined["specialFeature"] = dayBeforeHoliday;
        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingSpecialNode;