# IoT-fusion component

IoT fusion is a streaming data fusion system that can create machine-learning-ready feature vectors out of various heterogeneous sensor streams (i.e. sensor data, weather forecasts and static data). The system consists of the following components:

* fusion (stream fusion component with integrated incremental learning models)
* modeling (separate modeling component based on Python's ```scikit-learn``` models, ```LightGBM``` and ```xgboost```)
* server (administrative server for communication with distributed fusion components)
* client (GUI for interaction with server nad further with fusion components)

# Docs
Documentation is available [here](docs/USERS-MANUAL.md).

# Publications
In case you use any of the components for your research, please refer to (and cite) the paper:
* [Kenda, K.; Kažič, B.; Novak, E.; Mladenić, D. Streaming Data Fusion for the Internet of Things. Sensors 2019, 19, 1955.](https://www.mdpi.com/1424-8220/19/8/1955)

## Applications
* [Kenda, K.; Mellios, N.; Senožetnik, M.; Pergar, P. Architecture for Stream Mining in Water Management.](https://www.frontiersin.org/journals/big-data) (in preparation)

## Related work
* [Kenda, K.; Kažič, B.; Stopar, L., Fortuna, B., Rupnik, J., Škrjanc, M.; Mladenić, D. Data Fusion Framework for Streaming Heterogeneous Data Sources](#) (in preparation)
* [Kenda, K., & Mladenić, D. Autonomous sensor data cleaning in stream mining setting. Business Systems Research Journal, 9(2), 69-79.](http://www.bsrjournal.org/vol-9-no-2.html)