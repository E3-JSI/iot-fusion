# Stream Fusion and Modeling Factory Scenario with weather

## Data Sources

For the best predictions only 2 sources have been identified as relevant:

* Factory energy consumption data (```ME_measurements.csv```)
* Date-time date (```DT_datetime.csv```)

### Add Weather
Go to `streaming/utilities/DarkSkyGrabber`. Configure `index.js` to grab data for specific dates for specific locations.
Run `npm install` / `npm start`.
Wait until it finishes.
This will store JSON formatted weather into `data.json`.
Move this file to `../data/weather/data.json`.

This file includes standard DarkSky format for 24 hourly records. When one is retrieving data in real time, the array has 48 records for 48 hours ahead. We make this by running the `convert.js`.

Run `node convert.js`. This will create `converted.json`, which will include historic weather forcast records in the same form as you would get current forcast records from DarkSky service. Move this file to `../data/weather/converted.json`.

Next, you have to go to the simulator in `src/utilities/SimulatorFactoryKafka`. You have to add a line with weather data inside into the `config` array. Add the following line somewhere in the array:

`{ type: "weather", nodeId: "W1", fileName: "../../data/weather/converted.json"},`

**Note that DarkSky has some missing data for Kemerovo in year 2017 and maybe also in other intervals!**

This is it. Repeat the other steps like for the other instances.