/**
 * streamingTrainNode (template)
 * Streaming train data node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingTrainNode extends streamingNode {
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
                { name: "long", type: "float" },
                { name: "lat", type: "float" },
                { name: "icsv", type: "float" },
                { name: "icat", type: "float" },
                { name: "itcu1", type: "float" },
                { name: "itcu2", type: "float" },
                { name: "speed", type: "float" },
                { name: "taext", type: "float" },
                { name: "taint", type: "float" },
                { name: "ucat", type: "float" },
                { name: "acc", type: "float" },
                { name: "pow", type: "float"}
            ]
        });
        this.rawstore = this.base.store(this.nodeId);
        // acceleration will be calculated from speed
        this.lastSpeed = 0;
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
        let isoTime = rec["time"];
        let long = (isNaN(rec["long"]) || rec["long"] == null) ? 0 : rec["long"];
        let lat = (isNaN(rec["lat"]) || rec["lat"] == null) ? 0 : rec["lat"];
        let icsv = (isNaN(rec["icsv"]) || rec["icsv"] == null) ? 0 : rec["icsv"];
        let icat = (isNaN(rec["icat"]) || rec["icat"] == null) ? 0 : rec["icat"];
        let itcu1 = (isNaN(rec["itcu1"]) || rec["itcu1"] == null) ? 0 : rec["itcu1"];
        let itcu2 = (isNaN(rec["itcu2"]) || rec["itcu2"] == null) ? 0 : rec["itcu2"];
        let speed = (isNaN(rec["speed"]) || rec["speed"] == null) ? 0 : rec["speed"];
        let taext = (isNaN(rec["taext"]) || rec["taext"] == null) ? 0 : rec["taext"];
        let taint = (isNaN(rec["taint"]) || rec["taint"] == null) ? 0 : rec["taint"];
        let ucat = (isNaN(rec["ucat"]) || rec["ucat"] == null) ? 0 : rec["ucat"];

        // unixts
        // QMiner does not parse seconds correctly if time is given with ISO string
        let unixts = Date.parse(isoTime);

        if (unixts <= this.lastTimestamp) {
            console.log("Train - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log("Timetamp is NaN!");
            return;
        }

        // calculate acceleration and power
        let interval = (unixts - this.lastTimestamp) / 1000;
        let acc = (speed - this.lastSpeed) / interval;
        acc = Math.round(acc * 100) / 100;
        let pow = ucat * icat;

        // remember last values (previous in the next step)
        this.lastTimestamp = unixts;
        this.lastSpeed = speed;

        // create ghost store record
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            long: long,
            lat: lat,
            icsv: icsv,
            icat: icat,
            itcu1: itcu1,
            itcu2: itcu2,
            speed: speed,
            taext: taext,
            taint: taint,
            ucat: ucat,
            acc: acc,
            pow: pow
        });

        console.log(acc, this.rawRecord);

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["long"] = long;
        combined["lat"] = lat;
        combined["icsv"] = icsv;
        combined["icat"] = icat;
        combined["itcu1"] = itcu1;
        combined["itcu2"] = itcu2;
        combined["speed"] = speed;
        combined["taext"] = taext;
        combined["taint"] = taint;
        combined["ucat"] = ucat;
        combined["acc"] = acc;
        combined["pow"] = pow;

        console.log(combined);

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingTrainNode;