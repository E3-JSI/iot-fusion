/**
 * streamingWeatherNode
 * Weather streaming node class for heterogeneous sensor stream data fusion.
 */
const streamingNode = require('./streamingNode.js');

class streamingWeatherNode extends streamingNode {
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

        // read config options
        this.datasize = config["datasize"] === undefined ? 48 : config["datasize"];
        this.datatype = config["datatype"] === undefined ? "hourly" : config["datatype"];

        // adding store
        // generating fields
        this.fields = [];
        this.fieldTypes = config["fieldtypes"] === undefined ?
            [ "temperature", "humidity", "pressure", "windSpeed", "windBearing", "cloudCover" ] :
            config["fieldtypes"];


        console.log(this.datatype, this.fieldTypes);


        for (let i = 0; i < this.datasize; i++) {
            for (let j in this.fieldTypes) {
                let fieldName = this.fieldTypes[j] + i;
                this.fields.push({ name: fieldName, type: "float" });
            }
        }

        // creating store
        this.base.createStore({
            name: this.nodeId,
            fields: this.fields
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
        // we DO NOT deal with aggregates with weather data (yet)
        // TODO: we can start using streamaggregates on this type of weather
        if (typeof rec == "string") {
            console.log(rec);
            rec = JSON.parse(rec);
        }

        // extract record from rec (according to the store construction)
        let record = {};

        if ((this.datatype in rec) && ("data" in rec[this.datatype]) && (rec[this.datatype].data.length >= this.datasize)) {
            // setting stampm manually since we do not have getAggregates function
            record["stampm"] = rec.currently.time * 1000;

            // populate other record properties
            // this.fieldTypes is already set from constructor
            for (let i = 0; i < this.datasize; i++) {
                for (let j in this.fieldTypes) {
                    let fieldName = this.fieldTypes[j] + i;
                    record[fieldName] = rec[this.datatype].data[i][this.fieldTypes[j]];
                    // convert potential null value to 0
                    if (record[fieldName] == null) rec[fieldName] = 0;
                }
            }

            let combined = record;

            // push the vector in the buffer
            this.buffer.push(combined);

            // call streamFusion hook for this sensor
            this.processRecordCb(this.fusionNodeI, this.parent);
        } else {
            console.log("NO WEATHER/WEATHER RECORD TOO SHORT (" + this.datasize + " "  + this.datatype + " records needed)!");
        }
    }
}

module.exports = streamingWeatherNode;
