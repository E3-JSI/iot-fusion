# Users' Manual

Manual is still under construction. Please check unit tests and apps folder for illustarations of configuration files and usage.

Exceptions are mentioned below.

## streamingWeatherNode

Streaming weather node accepts data in the DarkSky format. It is the only one, that is configurable at the moment.

Node config can include the following properties:

* `datasize`: number of records in the JSON array (default: 48)
* `datatype`: could be set either to `"hourly"` or `"daily"`
* `fieldTypes`: includes the field names in the data records; default are `["temperature", "humidity", "pressure", "windSpeed", "windBearing", "cloudCover"]`