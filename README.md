# mqtt2mystrom

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg?style=flat-square)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![npm](https://img.shields.io/npm/v/mqtt2mystrom.svg?style=flat-square)](https://www.npmjs.com/package/mqtt2mystrom)
[![travis](https://img.shields.io/travis/claudiospizzi/mqtt2mystrom.svg?style=flat-square)](https://travis-ci.org/claudiospizzi/mqtt2mystrom)

This node.js application is a bridge between the [MyStrom Switches] and a mqtt
broker. The relay status and the current power usage is published to mqtt. The
relay state (on, off) can be controlled over mqtt.

## Installation

This node.js application is installed from the npm repository and executed with
the node command. It will load the default configuration file *config.json*.

```bash
npm install -g mqtt2mystrom
node /usr/local/bin/mqtt2mystrom
```

Alternatively, the module can be executed as a docker container. Use the
following Dockerfile to build a container by injecting the config file.

```dockerfile
FROM node:alpine

RUN npm install -g mqtt2mystrom

COPY config.json /etc/mqtt2mystrom.json

ENTRYPOINT [ "/usr/local/bin/mqtt2mystrom", "/etc/mqtt2mystrom.json" ]
```

## Configuration

The following configuration file is an example. Please replace the desired
values like the mqtt url and add your MyStrom Switch devices. Automatic
discovery of MyStrom Switch devices is currently not possible.

```json
{
    "log": "debug",
    "mqtt": {
        "url": "mqtt://192.168.1.10",
        "name": "mystrom",
        "secure": false
    },
    "mystrom": {
        "pollInterval": 60,
        "switchDevices": [
            {
                "name": "MyStrom Switch 1",
                "address": "192.168.1.20"
            }
        ]
    }
}
```

## Topics

### Publish: Status Messages)

The current relay status and power usage is published to the following topics:
* `mystrom/relay/<SwitchName>`  
  The `val` will contain `0` if the switch is turned off and not relaying power
  and `1` if the switch is turned on and relaying power.
* `mystrom/power/<SwitchName>`  
  With the interval of the polling configuration, normally every minute, the
  current power usage is published to this topic. The currently used watt is in
  the payload `val`.

### Subscribe: Control Switch Relay

To control the relay status of a MyStrom Switch, use the following topics:
* `mystrom/set/<SwitchName>/on`  
  Turn power relaying on. No payload required.
* `mystrom/set/<SwitchName>/off`  
  Turn power relaying off. No payload required.

[MyStrom Switches]: https://mystrom.ch/de/wifi-switch/
