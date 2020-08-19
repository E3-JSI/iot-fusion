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
    fusionTick: 3600000,
    model: {
        horizon: 3,
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
            assert.deepEqual(ilEMA.updateStream([0, 42], 0), { ts: 10800000, value: null, horizon: 3 });
            ilEMA.updateStream([42, 1], 1 * 3600000);
            ilEMA.updateStream([42, 2], 2 * 3600000);
            ilEMA.updateStream([42, 3], 3 * 3600000);
            ilEMA.updateStream([42, 4], 4 * 3600000);
            assert.deepEqual(ilEMA.updateStream([42, 5], 5 * 3600000), { ts: 28800000, value: 42, horizon: 3 });
        });

        it ('update incremental mode - with value 40', function() {
            assert.deepEqual(ilEMA.updateStream([40, 6], 6 * 3600000),  { ts: 32400000, value: 41.333333333333336, horizon: 3 });
        });

    });
});