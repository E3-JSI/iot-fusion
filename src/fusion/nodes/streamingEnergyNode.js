/**
 * streamingEnergyNode
 * Energy data streaming node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingEnergyNode extends streamingNode {
    /**
     * constructor
     * @param {qm.Base}  base               QMiner base.
     * @param {json}     config             Streaming node config.
     * @param {json}     aggrConfig         Configuration of stream aggregates.
     * @param {callback} porcessRecordCb    Callback for invoking data fusion.
     * @param {int}      fusionNodeI        Node id in fusion object.
     */
    constructor(base, connectionConfig, config, aggrConfigs, processRecordCb, fusionNodeI, parent) {
        // super(base, connectionConfig, config);
        super(base, connectionConfig, config, aggrConfigs, processRecordCb, fusionNodeI, parent);
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
        // last data timestamp
        this.lastTimestamp = Number.MIN_SAFE_INTEGER;

        // adding store
        this.base.createStore({
            name: this.nodeId,
            fields: [
                { name: "Time", type: "datetime" },
                { name: "pc", type: "float" },
                { name: "pg", type: "float" },
                /*
                { name: "pc2", type: "float" },
                { name: "pc3", type: "float" },
                { name: "pg2", type: "float" },
                { name: "pg3", type: "float" },
                { name: "qc", type: "float" },
                { name: "qc2", type: "float" },
                { name: "qc3", type: "float" },
                { name: "qg", type: "float" },
                { name: "qg2", type: "float" },
                { name: "qg3", type: "float" },
                { name: "f1", type: "float" },
                { name: "i1", type: "float" },
                { name: "i2", type: "float" },
                { name: "i3", type: "float" },
                { name: "v1", type: "float" },
                { name: "v2", type: "float" },
                { name: "v3", type: "float" }
                */
            ]
        });
        this.rawstore = this.base.store(this.nodeId);

        // create appropriate stream aggregates
        // with selected stream aggregates definition
        super.createAggregates(aggrConfigs[config.aggrConfigId]);

        // run postConstructor
        super.postConstructor();
    }

    /**
     * processRecord()
     * @param {json} rec    Raw record from data source.
     */
    processRecord(rec) {
        // TODO: should we make separate data adapters and process already structured
        // TODO: data here?

        // console.log("Process record: " + this.config.nodeid);

        // virtually add to raw store
        // create unix timestamp from raw data (seconds)
        let unixts = rec["stamp"] * 1000;

        // do we have a new measurement?
        // if not, we just ignore it
        if (this.lastTimestamp < unixts) {
            // update last timestamp
            this.lastTimestamp = unixts;
            // create ISO date-time string, consumed by QMiner
            let date = new Date(unixts);
            let isoTime;
            if (isNaN(date) == true) {
                isoTime = 0;
            } else {
                isoTime = date.toISOString();
            }
            // null can be parsed like Number(null)=0, therefore it is understood as a number
            let pc = (("pc" in rec) && isNaN(rec["pc"])) ? 0 : rec["pc"];
            let pg = (("pg" in rec) && isNaN(rec["pg"])) ? 0 : rec["pg"];
            // TODO: should we use last value here?
            if (pc == null) pc = 0;
            if (pg == null) pg = 0;
            //let pg = isNaN(rec["pg"]) ? 0 : rec["pg"];

            // create ghost store record
            this.rawRecord = this.rawstore.newRecord({
                Time: isoTime,
                pc: pc,
                pg: pg,
                /*
                pc2: rec["pc2"], pc3: rec["pc3"],
                pg2: rec["pg2"], pg3: rec["pg3"],
                qc: rec["qc"], qc2: rec["qc2"], qc3: rec["qc3"],
                qg: rec["qg"], qg2: rec["qg2"], qg3: rec["qg3"],
                f1: rec["f1"],
                i1: rec["i1"], i2: rec["i2"], i3: rec["i3"],
                v1: rec["v1"], v2: rec["v2"], v3: rec["v3"]
                */
            });

            // trigger stream aggregates bound to Raw store - first stage of resampling
            this.rawstore.triggerOnAddCallbacks(this.rawRecord);

            // reading current aggregates
            let aggregates = super.getAggregates();
            // combining it with current state vector
            let combined = aggregates;
            combined["pc"] = pc;
            combined["pg"] = pg;
            // push the vector in the buffer
            // each vector arrives at 15m interval,
            // let's resample fusionTick
            if (unixts % this.fusionTick == 0) {
                this.buffer.push(combined);

                // send aggregate to Kafka
                super.broadcastAggregates(aggregates);

                // call streamFusion hook for this sensor
                this.processRecordCb(this.fusionNodeI, this.parent);
            };
        } else {
            console.log("PROBLEM: EnergyNode timeline problem.");
        }
    }

}

module.exports = streamingEnergyNode;
