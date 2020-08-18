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

class EMAIncrementalModel extends AbstractIncrementalModel{
    /**
     * constructor
     * @param {json} config
     */
    constructor(config, fusion) {
        this.options = config.model.options;
        this.value = 0;
        this.k = 2 / (config.model.options.N + 1);
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
            this.EMA = label * k + (1 - k) * this.EMA;
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
module.exports = EMAIncrementalModel;