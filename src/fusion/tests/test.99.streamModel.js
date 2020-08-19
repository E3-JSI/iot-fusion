// models
const IncrementalLearning = require('../models/IncrementalLearning');
const EMAIncrementalModel = require('../models/EMA');
const StructuredEMAIncrementalModel = require('../models/StructuredEMA');

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

// model config RecLinReg
const modelConfigRecLinReg = {
    fusionTick: 3600000,
    model: {
        horizon: 3,
        label: 0,
        options: {
            method: 'RecLinReg'
        }
    }
}

// model config SEMA
const modelConfigSEMA = {
    fusionTick: 3600000,
    model: {
        horizon: 3,
        label: 0,
        options: {
            structuralFactorPosition: 1,
            method: 'StructuredEMA'
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
        ilRecLinReg = new IncrementalLearning(modelConfigRecLinReg, fakeFusion);
        ilSEMA = new IncrementalLearning(modelConfigSEMA, fakeFusion);

        // incremental models
        imEMA = new EMAIncrementalModel(modelConfigEMA.model.options, fakeFusion);
        imSEMA = new StructuredEMAIncrementalModel(modelConfigSEMA.model.options, fakeFusion);
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

    describe('SEMA model', function() {
        it('imSEMA instantiated', function() {
            assert.equal(typeof imSEMA, "object");
        });

        it('initial prediction', function() {
            assert.equal(imSEMA.predict([0, 0]), null);
        });

        it('update model - first time', function() {
            imSEMA.partialFit([0, 0], 42);
            assert.equal(imSEMA.predict([0, 0]), 42);
        });

        it('update model - 9 more times', function() {
            for (let i = 0; i < 9; i++) {
                imSEMA.partialFit([0, 0], 42);
            };
            assert.equal(imSEMA.predict([0, 0]), 42);
        });

        it('update model - with value 40', function() {
            imSEMA.partialFit([0, 0], 40);
            assert.equal(imSEMA.predict([0, 0]), 41.333333333333336);
        });

        it('update many different models', function() {
            for (let j = 0; j < 3; j++) {
                for (let h = 0; h < 24; h++) {
                    imSEMA.partialFit([0, h], h + j);
                }
            }

            for (let h = 1; h < 24; h++) {
                assert.equal(imSEMA.predict([0, h]).toFixed(5), h + .88889);
            }

        });
    });

    describe('incremental learning component - EMA', function() {
        it('ilEMA instantiated', function() {
            assert.equal(typeof ilEMA, "object");
        });

        it('update incremental model - first time', function() {
            assert.deepEqual(ilEMA.updateStream([42, 0], 0), { ts: 10800000, value: null, horizon: 3 });
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

    describe('incremental learning component - RecLinReg', function() {
        it('ilRecLinReg instantiated', function() {
            assert.equal(typeof ilRecLinReg, "object");
        });

        it('update incremental model - first time', function() {
            assert.deepEqual(ilRecLinReg.updateStream([42, 0], 0), { ts: 10800000, value: 0, horizon: 3 });

            for (let i = 1; i < 40; i++) {
                ilRecLinReg.updateStream([42 + i, i], i * 3600000);
            }

            i = 40;
            // prediction for 3 hour prediction horizon should be around 85 as we have a linear function with k = 1
            assert.deepEqual(ilRecLinReg.updateStream([42 + i, i], i * 3600000), { ts: 154800000, value: 85.0736902918679, horizon: 3 });
        });

    });

    describe('incremental learning component - StructuredEMA', function() {
        it('ilSEMA instantiated', function() {
            assert.equal(typeof ilSEMA, "object");
        });

        it('update incremental model - first time', function() {
            assert.deepEqual(ilSEMA.updateStream([42, 0], 0), { ts: 10800000, value: null, horizon: 3 });

            for (let i = 1; i < 72; i++) {
                ilSEMA.updateStream([42 + i, i % 24], i * 3600000);
            }

            i = 73;
            // prediction for 3 hour prediction horizon should be around 85 as we have a linear function with k = 1
            assert.deepEqual(ilSEMA.updateStream([42 + i, i % 24], i * 3600000), { ts: 154800000, value: 85.0736902918679, horizon: 3 });
        });
    });

});