/**
 * StructuredEMAIncrementalModel
 * EMA that is caluclated separate for each value of the first feature in the dataset.
 * This is useful, if we want a separate EMA model for each hour of the day, for example.
 */

// includes
const qm = require('qminer');
const la = require('qminer').la;
const fs = require('fs');
const AbstractIncrementalModel = require('./abstractIncrementalModel');

class StructuredEMAIncrementalModel extends AbstractIncrementalModel{
    /**
     * constructor
     * @param {json} config
     */
    constructor(options, fusion) {
        super(options, fusion);
        this.options = options;
        this.value = 0;
        let optionN = options.N !== undefined ? options.N : 5;
        this.k = 2 / (optionN + 1);
        this.EMA = {};
    }

    /**
     * partialFit
     * @param {array} featureVec Array of values in feature vector.
     * @param {float} label True value for regression.
     */
    partialFit(featureVec, label) {
        const structuralFactor = featureVec[0];

        if (this.EMA[structuralFactor] === null) {
            this.EMA[structuralFactor] = label
        } else {
            this.EMA[structuralFactor] = label * this.k + (1 - this.k) * this.EMA[structuralFactor];
        }
    }

    /**
     * predict
     * @param {array} featureVec Array of values in feature vector.
     */
    predict(featureVec) {
        const structuralFactor = featureVec[0];
        return this.EMA[structuralFactor];
    }

    /**
     * save
     * Saves current model into write stream.
     */
    save(fout) {
        // not implemented
    }

    /**
     * load
     * Loads the model from read stream.
     */
    load(fin) {
        // not implemented
    }
}

// expose class to the outside world
module.exports = StructuredEMAIncrementalModel;