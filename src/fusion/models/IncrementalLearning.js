/**
 * IncrementalLearning
 * Main clas for stream modeling, connected to stream fusion. The component
 * expects uniformly resampled stream.
 */

// includes
const qm = require('qminer');
const la = require('qminer').la;
const fs = require('fs');

// additional incremental models
const IncrementalModelEMA = require('./EMA');


class IncrementalLearning {
    /**
     * constructor
     * @param {json} config
     */
    constructor(config, fusion) {
        // set prediction horizon
        this.horizon = config.model.horizon;
        this.fusionTick = config.fusionTick;
        // set master field (first one)
        this.label = config.model.label;
        // method specific options
        this.options = config.model.options;
        // model is not initiated
        this.initiated = false;
        this.predictionBuffer = [];

        // create empty buffer
        this.buffer = [];
        // set model filename
        this.filename = './models/' + fusion.fusion_id + "-" + this.options.method + ".bin";
    }

    /**
     * updateStream
     * @param {array} featureVec Array of values in feature vector.
     */
    updateStream(featureVec, zeroTimestamp) {
        // make partial fit
        this.buffer.push(featureVec);

        if (this.buffer.length > this.horizon) {
            // use current label
            let label = featureVec[this.label];
            // use feature vector from a horizon inteval in the history
            let learningFeatureVector = new la.Vector(this.buffer[this.buffer.length - this.horizon - 1]);
            // make cleaning
            try {
                this.model.partialFit(learningFeatureVector, label);
            } catch (e) {
                console.log("PARTIAL FIT ERROR!", e);
                console.log(this.buffer[this.buffer.length - this.horizon - 1], label)
                process.exit();
            }
        }

        // model initiation can only be done after first sample is received
        if (this.buffer.length > 0) {

            // initialize model
            if (this.initiated == false) {
                this.initiated = true;

                // enrich options with dim parameter
                this.options.dim = featureVec.length;

                // initialize method (only lin. reg. supported by now)
                if (this.options.method === "RecLinReg") {
                    this.model = new qm.analytics.RecLinReg(this.options);
                } else {
                    // moving average EMA
                    console.log(this.options);
                    this.model = new IncrementalModelEMA(this.options);
                }
            }

            let qmFeatureVec = new la.Vector(featureVec);
            let prediction = this.model.predict(featureVec);
            // push prediction to prediction buffer
            this.predictionBuffer.push(prediction);
            if (this.predictionBuffer.length > this.horizon) this.predictionBuffer.shift();

            // TODO: remove this after testing
            fs.appendFileSync('predictions.csv', this.predictionBuffer[0] + "," + featureVec[this.label] + '\n');
            console.log("Prediction: ", prediction.toFixed(2));

            // controlling buffer length
            if (this.buffer.length > this.horizon) this.buffer.shift();

            let unixts = zeroTimestamp + this.horizon * this.fusionTick;
            return {
                ts: unixts,
                value: prediction,
                horizon: this.horizon
            };
        }
    }

    /**
     * saveModel
     * Saves current model into a file.
     */
    saveModel() {
        let fout = fs.OpenWrite(this.filename);
        this.model.save(fout);
        fout.close();
    }

    /**
     * loadModel
     * Loads the model from a file.
     */
    loadModel() {
        let fin = fs.OpenRead(this.filename);
        this.model = new qm.analytics.RecLinReg(fin);
        fin.close();
    }
}

// expose class to the outside world
module.exports = IncrementalLearning;