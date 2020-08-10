# Stream Fusion and Modeling - Smart City Scenario

## Data Sources

For the best predictions only 2 sources have been identified as relevant:

* Factory energy consumption data (```ME_measurements.csv```)
* Date-time date (```DT_datetime.csv```)

## Components

You have to setup the following components:

* Kafka accessible to the simulator, stream fusion and modeling components
* All the beforementioned components have Kafka connection string set-up (see docs)
* Simulator (```utilities/SimulatorFactoryKafka```) is ready (open it in separate command prompt)
* streamFusion (```streamFusion```) is ready (open in a separate command prompt)
* modeling (```modeling```) is ready with Python environment (see docs) and open in a separate command prompt



## Building Learning Set and Models

1. Go to streamFusion and delete all the files in the ```data``` directory (here the feature vectors will be generated)
2. Start streamFusion (do check if there is some old data present on the Kafka topics, if it is, please wait until the stream is consumed by the component and restart the component) with ```npm start 0 2``` (this will start 3 models for 3 different predefined prediction horizons - currently 12, 24 and 36h)
3. Start the simulator and wait until the requested amount of data has been ingested (i.e. from ```2016-01-01``` to ```2017-06-01```); hint - this is when ```json``` files are approximately 2.1MB long or when approximately 24000 messages have been sent via simulator.
4. Copy the files from ```streamFusion/data``` folder to ```data/fused```.
5. Train the models (go to ```modeling```) and run ```python main.py -f -s```


## Running Modeling

Run your modeling component with ```python main.py -l -f``` and predictions will be generated to appropriate topic.

Modeling component is stateless and can be run anytime.