const SimulatorNode = require('./simulator_node.js');

class Simulator {
    constructor(config) {
        this.config = config;
        this.repetitions = 0;
        this.nodes = [];

        // init nodes
        for (let nodeConfig of config.nodes) {
            this.nodes.push(new SimulatorNode(nodeConfig, config.connection));
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

        for (let node of this.nodes) {
            node.init(this.realstartts);
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