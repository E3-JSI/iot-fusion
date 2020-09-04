/**
 * streamingSmartLampNode (template)
 * Streaming smart lamp node class for heterogeneous sensor stream data fusion.
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
                { name: "rh", type: "float" },      // relative humidity
                { name: "temp", type: "float" },       // temperature
                { name: "no2", type: "float" },
                { name: "o3", type: "float" },
                { name: "pm025", type: "float" },
                { name: "pm100", type: "float" },
                { name: "carno", type: "float" },
                { name: "vavg", type: "float" },
                { name: "vmax", type: "float" },
                { name: "vmin", type: "float" },
                { name: "w", type: "float" },
                { name: "caqi", type: "float" }
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
     * Calculate a CAQI sub-index. Interpolate it in the limits.
     *
     * @param {float[5]} 0, 25, 50, 75 and 100-percentile limits.
     * @param {*} v Measurement value.
     */
    calculateSubIndex(f, v) {
        if (v >= f[4]) return 100;
        for (let i = 3; i >= 0; i--) {
            if (v > f[i]) {
                const low_limit = i * 25;
                const high_limit = low_limit + 25;

                const sub_index =
                    low_limit +
                    (high_limit - low_limit) * (v - f[i]) / (f[i + 1] - f[i]);

                return sub_index;
            }
        }
        return 0;
    }

    /**
     * CAQI calculation.
     * https://en.wikipedia.org/wiki/Air_quality_index
     *
     * @param {float} no2 NO2 concentration in \mu g/m3.
     * @param {float} pm100 PM10 concentration in \mu g/m3.
     * @param {float} o3 O3 concentration in \mu g/m3.
     * @param {float} pm025 PM2.5 concentration in \mu g/m3.
     */
    calculateCAQI(no2, pm100, o3, pm025) {
        let sub_indices = [
            this.calculateSubIndex([0, 50, 100, 200, 400], no2),
            this.calculateSubIndex([0, 25, 50, 90, 180], pm100),
            this.calculateSubIndex([0, 60, 120, 180, 240], o3),
            this.calculateSubIndex([0, 15, 30, 55, 110], pm025)
        ];

        return Math.max(...sub_indices);
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
        let unixts = rec["stampm"];
        let rh = (isNaN(rec["rh"]) || rec["rh"] == null) ? 0 : rec["rh"];
        let temp = (isNaN(rec["temp"]) || rec["temp"] == null) ? 0 : rec["temp"];
        let no2 = (isNaN(rec["no2"]) || rec["no2"] == null) ? 0 : rec["no2"];
        let o3 = (isNaN(rec["o3"]) || rec["o3"] == null) ? 0 : rec["o3"];
        let pm025 = (isNaN(rec["pm025"]) || rec["pm025"] == null) ? 0 : rec["pm025"];
        let pm100 = (isNaN(rec["pm100"]) || rec["pm100"] == null) ? 0 : rec["pm100"];
        let carno = (isNaN(rec["carno"]) || rec["carno"] == null) ? 0 : rec["carno"];
        let vavg = (isNaN(rec["vavg"]) || rec["vavg"] == null) ? 0 : rec["vavg"];
        let vmax = (isNaN(rec["vmax"]) || rec["vmax"] == null) ? 0 : rec["vmax"];
        let vmin = (isNaN(rec["vmin"]) || rec["vmin"] == null) ? 0 : rec["vmin"];
        let w = (isNaN(rec["w"]) || rec["w"] == null) ? 0 : rec["w"];


        // calculate CAQI
        let caqi = this.calculateCAQI(no2, pm100, o3, pm025);

        if (unixts <= this.lastTimestamp) {
            console.log("Air Quality - double timestamp.");
            return;
        }

        if (isNaN(unixts)) {
            console.log("Air Quality - timestamp is NaN!");
            return;
        }

        // create ghost store record
        this.rawRecord = this.rawstore.newRecord({
            Time: unixts,
            rh: rh,
            temp: temp,
            no2: no2,
            o3: o3,
            pm025: pm025,
            pm100: pm100,
            carno: carno,
            vavg: vavg,
            vmax: vmax,
            vmin: vmin,
            w: w,
            caqi: caqi
        });

        // trigger stream aggregates bound to Raw store - first stage of resampling
        this.rawstore.triggerOnAddCallbacks(this.rawRecord);
        this.lastTimestamp = unixts;

        // reading current aggregates
        let aggregates = super.getAggregates();
        // combining it with current state vector
        let combined = aggregates;
        // update combined vector with current values
        combined["rh"] = rh;
        combined["temp"] = temp;
        combined["no2"] = no2;
        combined["o3"] = o3;
        combined["pm025"] = pm025;
        combined["pm100"] = pm100;
        combined["carno"] = carno;
        combined["vavg"] = vavg;
        combined["vmax"] = vmax;
        combined["vmin"] = vmin;
        combined["w"] = w;
        combined["caqi"] = caqi;

        // push the vector in the buffer
        this.buffer.push(combined);

        // send aggregate to Kafka
        super.broadcastAggregates(aggregates);

        // call streamFusion hook for this sensor
        this.processRecordCb(this.fusionNodeI, this.parent);
    }

}

module.exports = streamingAirQualityNode;