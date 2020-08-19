/**
 * AbstractIncrementalModel
 * Main abstract class for incremental models, connected to stream fusion. The component
 * expects uniformly resampled stream.
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
        this.EMA = null;
    }

    /**
     * partialFit
     * @param {array} featureVec Array of values in feature vector.
     * @param {float} label True value for regression.
     */
    partialFit(featureVec, label) {
        if (this.EMA === null) {
            this.EMA = label
        } else {
            this.EMA = label * this.k + (1 - this.k) * this.EMA;
        }
    }

    /**
     * predict
     * @param {array} featureVec Array of values in feature vector.
     */
    predict(featureVec) {
        return this.EMA;
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