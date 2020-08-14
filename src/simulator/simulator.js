const SimulatorNode = require('./simulator_node.js');

class Simulator {
    constructor(config) {
        this.config = config;
        this.repetitions = 0;
        this.nodes = [];

        // init nodes
        for (let nodeConfig of config.nodes) {
            this.nodes.push(new SimulatorNode(nodeConfig));
        }
        this.start();
    }

    /**
     * Simulator's main loop is triggered by setInterval in the
     * this.start().
     */
    mainloop() {
        this.repetitions++;
        let now = new Date().getTime();
        let relativeOriginal = now - this.realstartts;
        let relative = relativeOriginal * this.config.timeFactor;
        for (let node of this.nodes) {
            node.check(relative);
        };
        if (this.repetitions % 1000 === 0) {
            console.log("Repetition:", this.repetitions, "Relative time:", relative);
        };
    }

    /**
     * Starting the loop.
     */
    start() {
        // remember timestamp
        let currentDate = new Date();
        this.realstartts = currentDate.getTime();

        // should we normalize start time
        if (this.config.normalizeStartTime == "hour") {
            // get the full hour near the current timestamp
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        }

        this.startts = currentDate.getTime();

        for (let node of this.nodes) {
            node.init(this.startts);
        };

        this.loop = setInterval(
            (function () { this.mainloop()}).bind(this), 1
        );
    }

    /**
     * Stopping the loop.
     */
    stop() {
        clearInterval(this.loop);
    }
}

module.exports = Simulator;