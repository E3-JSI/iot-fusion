/**
 * staticCalculatedNode
 * Node providing static data. Uses streamingNode interface, but does not acctually need a data stream.
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
        this.nodeFrequency = config.nodeFrequency !== undefined ? config.nodeFrequency : 3600000;
        this.holidays = config.holidays !== undefined ? config.holidays : [ '2020-12-25', '2021-01-01'];

        // initialize last timestamp
        this.lastTimestamp = 0;

        // we do not run post constructor for this node since it does not connect to any
        // brokers
        // super.postConstructor();
    }

    /**
     * This node is always slave.
     */
    isMaster() {
        return false;
    }

    /**
     * Remember zero offset, no need to find it in the buffer since the features
     * are all calculated.
     *
     * @param {long} zeroTimestamp  Zero timestamp for the master.
     */
    setSlaveOffset(zeroTimestamp) {
        this.zeroTimestamp = zeroTimestamp;
        return true;
    }

    /**
     * checkDataAvailability
     * All the data is always available here.
     */
    checkDataAvailability() {
        return true;
    }

    /**
     * Nothing to do as we do not have rows in this node.
     */
    deleteObsoleteRows() {
        // do nothing
    }

    /**
     * Calculate a particular static for a particular timestamp.
     *
     * @param {int} ts Timestamp in milliseconds.
     * @param {string} attr Attribute name.
     */
    staticValue(ts, attr) {
        let val;

        if (attr == "random") {
            val = Math.random();
        } else if (attr == "hourOfDay") {
            val = new Date(ts).getHours();
        } else if (attr == "dayOfWeek") {
            val = new Date(ts).getDay();
        } else if (attr == "dayAfterHoliday") {
            val = 0;
            let date = new Date(ts - 24 * 3600 * 1000).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (attr == "dayBeforeHoliday") {
            val = 0;
            let date = new Date(ts + 24 * 3600 * 1000).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (attr == "dayOfYear") {
            let date = new Date(ts);
            let first = new Date(date.getFullYear(), 0, 1);
            val = Math.round(((date - first) / 1000 / 60 / 60 / 24) + .5, 0);
        } else if (attr == "dayOfMonth") {
            val = new Date(ts).getDate();
        } else if (attr == "holiday") {
            val = 0;
            let date = new Date(ts).toJSON().slice(0, 10);
            if (this.holidays.includes(date)) val = 1;
        } else if (attr == "monthOfYear") {
            val = new Date(ts).getMonth() + 1;
        } else if (attr == "weekEnd") {
            val = 0;
            let day = new Date(ts).getDay();
            if ((day >= 6) || (day == 0)) val = 1;
        }

        return val;
    }


    /**
     * Calculates the aggregate.
     *
     * @param {string} aggr Type of aggregate.
     * @param {array} values Array of floats.
     */
    calculateAggregate(aggr, values) {
        let val = -1;

        if (aggr === "ma") {
            val = values.reduce((a, b) => a + b) / values.length;
        } else if (aggr === "variance") {
            let mean = values.reduce((a, b) => a + b) / values.length;
            let intermediate = values.map((num) => Math.pow(num - mean, 2));
            // calculate mean
            val = intermediate.reduce((a, b) => a + b) / intermediate.length;
        } else if (aggr === "min") {
            val = Math.min(...values);
        } else if (aggr === "max") {
            val = Math.max(...values);
        }

        return val;
    }

    /**
     * Calculate static values or derived values for a particular timestamp.
     *
     * @param {int} ts Timestamp.
     * @param {string} attr Attribute name.
     */
    calculateValue(ts, attr) {
        // format of aggr: name or name|aggr|windowInMilliseconds
        let names = attr.split("|");
        const name = names[0];
        if (names.length !== 3) {
            return this.staticValue(ts, name);
        } else {
            const aggr = names[1];
            const windowLength = parseInt(names[2]);
            const intervals = Math.floor(windowLength / this.nodeFrequency);

            // generate the array of numbers
            let values = [];
            for (let i = 1; i <= intervals; i++) {
                values.push(this.staticValue(ts - i * this.nodeFrequency, name));
            }

            return this.calculateAggregate(aggr, values);
        }
    }

    /**
     * Returns partial feature vector.
     */
    getPartialFeatureVector() {
        // define feature vector
        let vec = [];

        for (let i in this.config.attributes) {
            let attributes = this.config.attributes[i].attributes;

            // get time for current attribute family
            let offsetTimestamp = this.zeroTimestamp + this.config.attributes[i].time * this.nodeFrequency;

            for (let j in attributes) {
                let type = attributes[j].type; // value, timeDiff
                let attrName = attributes[j].name;

                if (type == "value") {
                    let value = this.calculateValue(offsetTimestamp, attrName);
                    vec.push(value);
                } else if (type == "timeDiff") {
                    let offset2Timestamp = offsetTimestamp - attributes[j].interval * this.nodeFrequency;
                    let value = this.calculateValue(offsetTimestamp, attrName) - this.calculateValue(offset2Timestamp, attrName);
                    vec.push(value);
                }
            }
        }

        return vec;
    }

    /**
     * processRecord()
     * @param {json} rec    Raw record from data source.
     */
    processRecord(rec) {
        // this is not implemented
    }

}

module.exports = streamingAirQualityNode;