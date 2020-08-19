
/**
 * streamingStaticNode
 * Static streaming node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingStaticNode extends streamingNode {

    /**
     * constructor
     * @param {qm.Base}  base               QMiner base.
     * @param {json}     config             Streaming node config.
     * @param {json}     aggrConfig         Configuration of stream aggregates.
     * @param {callback} porcessRecordCb    Callback for invoking data fusion.
     * @param {int}      fusionNodeI        Node id in fusion object.
     * @param {object}   parent             Pointer to parent (for processRecordCb).
     */
    constructor(base, connectionConfig, config, aggrConfigs, processRecordCb, fusionNodeI, parent) {
        super(base, connectionConfig, config, aggrConfigs, processRecordCb, fusionNodeI, parent);

        // adding store
        this.base.createStore({
            name: this.nodeId,
            fields: [
                { name: "Time", type: "datetime" },
                { name: "dayAfterHoliday", type: "float" },
                { name: "dayBeforeHoliday", type: "float" },
                { name: "dayOfMonth", type: "float" },
                { name: "dayOfWeek", type: "float" },
                { name: "dayOfYear", type: "float" },
                { name: "holiday", type: "float" },
                { name: "monthOfYear", type: "float" },
                { name: "weekEnd", type: "float" }
            ]
        });
        this.rawstore = this.base.store(this.nodeId);

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
        // TODO: should we make separate data adapters and process already structured
        // TODO: data here?

        if (typeof rec == "string") {
            rec = JSON.parse(rec);
        }

        // virtually add to raw store
        // get ISO time
        let isoTime = rec["timestamp"];
        let timeOfDay = rec["timeOfDay"];
        let dayBeforeHoliday = rec["dayBeforeHoliday"];
        let dayAfterHoliday = rec["dayAfterHoliday"];
        let dayOfMonth = rec["dayOfMonth"];
        let dayOfWeek = rec["dayOfWeek"];
        let dayOfYear = rec["dayOfYear"];
        let holiday = rec["holiday"];
        let monthOfYear = rec["monthOfYear"];
        let weekEnd = rec["weekEnd"];

        // if any value is undefined
        if (typeof isoTime == "undefined") return;

        // create ghost store record
        let record = {
            Time: isoTime,
            timeOfDay: timeOfDay,
            dayBeforeHoliday: dayBeforeHoliday,
            dayAfterHoliday: dayAfterHoliday,
            dayOfMonth: dayOfMonth,
            dayOfWeek: dayOfWeek,
            dayOfYear: dayOfYear,
            holiday: holiday,
            monthOfYear: monthOfYear,
            weekEnd: weekEnd
        };

        this.rawRecord = this.rawstore.newRecord(record);

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        combined["stampm"] = new Date(isoTime).getTime();
        combined["timeOfDay"] = timeOfDay;
        combined["dayBeforeHoliday"] = dayBeforeHoliday;
        combined["dayAfterHoliday"] = dayAfterHoliday;
        combined["dayOfMonth"] = dayOfMonth;
        combined["dayOfWeek"] = dayOfWeek;
        combined["dayOfYear"] = dayOfYear;
        combined["holiday"] = holiday;
        combined["monthOfYear"] = monthOfYear;
        combined["weekEnd"] = weekEnd;
        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingStaticNode;