/**
 * AbstractIncrementalModel
 * Main abstract class for incremental models, connected to stream fusion. The component
 * expects uniformly resampled stream.
 */

// includes
const qm = require('qminer');
const la = require('qminer').la;
const fs = require('fs');

class AbstractIncrementalModel {
    /**
     * constructor
     * @param {json} config
     */
    constructor(options, fusion) {
        this.options = options;
    }

    /**
     * partialFit
     * @param {array} featureVec Array of values in feature vector.
     * @param {float} label True value for regression.
     */
    partialFit(featureVec, label) {
        // not implemented
    }

    /**
     * predict
     * @param {array} featureVec Array of values in feature vector.
     */
    predict(featureVec) {
        // not implemented
    }

    /**
     * saveModel
     * Saves current model into a file.
     */
    save() {
        // not implemented
    }

    /**
     * loadModel
     * Loads the model from a file.
     */
    load() {
        // not implemented
    }
}

// expose class to the outside world
module.exports = AbstractIncrementalModel;