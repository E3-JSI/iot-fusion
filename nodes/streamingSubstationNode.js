/**
 * streamingEnergyNode
 * Energy data streaming node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');
class streamingSubstationNode extends streamingNode {
    /**
     * constructor
     * @param {qm.Base}  base               QMiner base.
     * @param {json}     config             Streaming node config.
     * @param {json}     aggrConfig         Configuration of stream aggregates.
     * @param {callback} processRecordCb    Callback for invoking data fusion.
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
        // last value initialization
        this.lastcurrent = 0;
        this.lastvoltage = 0;

        // adding store
        this.base.createStore({
            name: this.nodeId,
            fields: [
                { name: "Time", type: "datetime" },
                { name: "current", type: "float" },
                { name: "voltage", type: "float" },
                { name: "power", type: "float" }
            ]
        });
        this.rawstore = this.base.store(this.nodeId);

        // create EMA aggregate for missing value imputation - current
        this.currentTick = this.rawstore.addStreamAggr({
            type: "timeSeriesTick",
            timestamp: "Time",
            value: "current"
        });
        this.currentEMA = this.rawstore.addStreamAggr({
            type: "ema",
            inAggr: this.currentTick,
            emaType: "previous",
            interval: 15 * 60 * 1000,
            initWindow: 0
        });

        // create EMA aggregate for missing value imputation - voltage
        this.voltageTick = this.rawstore.addStreamAggr({
            type: "timeSeriesTick",
            timestamp: "Time",
            value: "voltage"
        });
        this.voltageEMA = this.rawstore.addStreamAggr({
            type: "ema",
            inAggr: this.voltageTick,
            emaType: "previous",
            interval: 15 * 60 * 1000,
            initWindow: 0
        });

        // create EMA aggregate for missing value imputation - power
        this.powerTick = this.rawstore.addStreamAggr({
            type: "timeSeriesTick",
            timestamp: "Time",
            value: "power"
        });
        this.powerEMA = this.rawstore.addStreamAggr({
            type: "ema",
            inAggr: this.voltageTick,
            emaType: "previous",
            interval: 15 * 60 * 1000,
            initWindow: 0
        });

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
        let unixts = rec["timestamp"];

        // do we have a new measurement?
        // if not, we just ignore it
        if (this.lastTimestamp < unixts) {
            // create ISO date-time string, consumed by QMiner
            let date = new Date(unixts);
            let isoTime;
            if (isNaN(date) == true) {
                isoTime = 0;
            } else {
                isoTime = date.toISOString();
            }
            // null can be parsed like Number(null)=0, therefore it is understood as a number
            // replacing missing values with 15 min EMA
            let currentA = (!("current" in rec) || isNaN(rec["current"]) || (rec["current"] == null));
            let voltageA = (!("voltage" in rec) || isNaN(rec["voltage"]) || (rec["voltage"] == null));

            let current = currentA ? this.currentEMA.getFloat() : rec["current"];
            let voltage = voltageA ? this.voltageEMA.getFloat() : rec["voltage"];

            // simply calculating power from current and voltage P = U * I
            let power = (currentA && voltageA) ? this.powerEMA.getFloat() : current * voltage;

            // create ghost store record
            this.rawRecord = this.rawstore.newRecord({
                Time: isoTime,
                current: current,
                voltage: voltage,
                power: power
            });

            // trigger stream aggregates bound to Raw store - first stage of resampling
            this.rawstore.triggerOnAddCallbacks(this.rawRecord);

            // reading current aggregates
            let aggregates = super.getAggregates();
            // combining it with current state vector
            let combined = aggregates;
            combined["stampm"] = unixts;
            combined["current"] = this.lastcurrent;
            combined["voltage"] = this.lastvoltage;
            // combined["pg"] = pg;
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
            console.log("PROBLEM: SubstationNode timeline problem.");
        }
    }

}

module.exports = streamingSubstationNode;
