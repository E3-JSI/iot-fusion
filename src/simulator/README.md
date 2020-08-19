# Data Simulator

Data simulator will simulate a stream of data (including static, weather and IoT data) to Kafka topics.

## Running

Use `npm install` and `npm start`.

## Configuration example
Configuration is available in `config.json`.

```json
{
    "timeFactor": 3600,
    "log": "none",
    "connection": {
        "type": "kafka",
        "kafka": "localhost:9092"
    },
    "nodes": [
        {
            "nodeid": "SL1",
            "timeFormat": "unixms",
            "normalizeStartTime": "hour",
            "frequency": 3600000,
            "fields": [
                { "name": "dimml", "type": "random" },
                { "name": "pact", "type": "random" }
            ],
            "format": "{ time: %time%, dimml: %dimml%, pact: %pact% }"
        },
        {
            "nodeid": "W1",
            "timeFormat": "unixs",
            "normalizeStartTime": "hour",
            "frequency": 3600000,
            "fields": [
                { "name": "temperature", "type": "random" },
                { "name": "humidity", "type": "random" },
                { "name": "windSpeed", "type": "random" },
                { "name": "windBearing", "type": "random" },
                { "name": "cloudCover", "type": "random" },
                { "name": "pressure", "type": "random" },
                { "name": "daylight", "type": "random" },
                { "name": "parts", "type": "parts" }
            ],
            "parts": 24,
            "format": "{ currently: { time: %time% }, hourly: { data: [%parts%] }}",
            "formatPart": "{time: %time%, temperature: %temperature%, humidity: %humidity%, windSpeed: %windSpeed%, windBearing: %windBearing%, cloudCover: %cloudCover%, pressure: %pressure%, daylight: %daylight%}"
        },
        {
            "nodeid": "S1",
            "timeFormat": "unixms",
            "normalizeStartTime": "hour",
            "frequency": 3600000,
            "horizon": 72,
            "fields": [
                { "name": "hourOfDay", "type": "hourOfDay" },
                { "name": "holiday", "type": "holiday" },
                { "name": "dayAfterHoliday", "type": "dayAfterHoliday" },
                { "name": "dayBeforeHoliday", "type": "dayBeforeHoliday" },
                { "name": "dayOfWeek", "type": "dayOfWeek" },
                { "name": "dayOfMonth", "type": "dayOfMonth" },
                { "name": "dayOfYear", "type": "dayOfYear" },
                { "name": "monthOfYear", "type": "monthOfYear" },
                { "name": "weekEnd", "type": "weekEnd" }
            ],
            "format": "{ timestamp: %time%, timeOfDay: %hourOfDay%, dayAfterHoliday: %dayAfterHoliday%, dayBeforeHoliday: %dayBeforeHoliday%, dayOfYear: %dayOfYear%, dayOfWeek: %dayOfWeek%, dayOfMonth: %dayOfMonth%, holiday: %holiday%, monthOfYear: %monthOfYear%, weekEnd: %weekEnd% }"
        }
    ]
}
```

Configuration includes the following parameters:

* `timeFactor` - how much faster the time is running in the simulator
* `nodes` - definition of nodes

Each node config includes:

* `nodeid` - id of the node to be used for Kafka topic `measurements_node_nodeid`
* `timeFormat` - can be empty od `unixms` (milliseconds) or `unixs` (seconds) in UNIX format
* `normalizeStartTime` - when sending of a measurement is triggered, should this be at a full hour, day, minute, second? Possible options are `[ "second", "minute", "hour", "day" ]`
* `horizon` - do we want to send this data stream for the future measurements?
* `fields` - definition of fields
* `format` - string of the JSON to send, with %field% codes

Each field includes:

* `name` - name of the field, to be used in replacing tags in `format`
* `type` - type of field, which can be `[ "random", "hourOfDay", "dayOfWeek", "dayOfMonth", "dayOfYear", "monthOfYear", "holiday", "dayBeforeHoliday", "dayAfterHoliday", "weekEnd" ]`