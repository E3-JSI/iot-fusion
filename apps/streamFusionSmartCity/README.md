# Stream Fusion and Modeling - Smart City Scenario

## Data Sources

For the best predictions only 2 sources have been identified as relevant:

* Air quality / smart lamp data
* Weather data with daily granularity for EMA 1-day-ahead models

## Components

You have to setup the following components:

* Kafka accessible to the simulator, stream fusion and modeling components
* All the beforementioned components have Kafka connection string set-up (see docs)
* Simulator (```src/simulator```) is ready (open it in separate command prompt)
* Data fusion component (```streamFusion```) is ready (open in a separate command prompt)
* Modeling is integrated in data fusion component

## Running Modeling

We recommend starting the components with PM2. For example with: `pm2 start index.airquality.EMA.3h.js`.
