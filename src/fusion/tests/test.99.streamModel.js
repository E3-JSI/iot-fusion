// models
const IncrementalLearning = require('../models/IncrementalLearning.js');
const EMAIncrementalModel = require('../models/EMA.js');

// helper includes
const fileManager = require('../../common/utils/fileManager.js');
const qm = require('qminer');
const fs = require('fs');

// example of unit tests
var assert = require('assert');

// model config EMA
const modelConfigEMA = {
    horizon: 3,
    fusionTick: 3600000,
    model: {
        label: 0,
        options: {
            method: 'EMA'
        }
    }
}

// fake fusion object
const fakeFusion = {
    fusion_id: "fakeFusion"
}

describe('incremental model', function() {
    let fusion;

    before(function() {
        // incremental learning - wrapper around a model
        ilEMA = new IncrementalLearning(modelConfigEMA, fakeFusion);

        // incremental models
        imEMA = new EMAIncrementalModel(modelConfigEMA.model.options, fakeFusion);
    });

    after(function() {
    });

    describe('EMA model', function() {
        it('imEMA instantiated', function() {
            assert.equal(typeof imEMA, "object");
        });

        it('initial prediction', function() {
            assert.equal(imEMA.predict(), null);
        });

        it('update model - first time', function() {
            imEMA.partialFit([], 42);
            assert.equal(imEMA.predict(), 42);
        });

        it('update model - 9 more times', function() {
            for (let i = 0; i < 9; i++) {
                imEMA.partialFit([], 42);
            };
            assert.equal(imEMA.predict(), 42);
        });

        it('update model - with value 40', function() {
            imEMA.partialFit([], 40);
            assert.equal(imEMA.predict(), 41.333333333333336);
        });
    });

    describe('incremental learning component', function() {
        it('ilEMA instantiated', function() {
            assert.equal(typeof ilEMA, "object");
        });

        it('update incremental model - first time', function() {
            assert.equal(ilEMA.updateStream([], 42), 42);
        });

    });
});