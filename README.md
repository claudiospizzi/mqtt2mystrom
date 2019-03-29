# mqtt2mystrom

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg?style=flat-square)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![npm](https://img.shields.io/npm/v/mqtt2mystrom.svg?style=flat-square)](https://www.npmjs.com/package/mqtt2mystrom)
[![travis](https://img.shields.io/travis/claudiospizzi/mqtt2mystrom.svg?style=flat-square)](https://travis-ci.org/claudiospizzi/mqtt2mystrom)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

This node.js application is a bridge between the [MyStrom Switches] and a mqtt
broker. The relay status and the current power usage is published to mqtt. The
relay state (on, off) can be controlled over mqtt.

## Installation

This node.js application is installed from the npm repository and executed with
the node command.

```bash
npm install -g mqtt2mystrom
node /usr/local/bin/mqtt2mystrom
```

Alternatively, the module can be executed as a docker container. Use the
following Dockerfile to build a container injecting the config file.

```dockerfile
FROM node:alpine

RUN npm install -g mqtt2mystrom@1.0.3

COPY config.json /etc/mqtt2mystrom.json

ENTRYPOINT [ "/usr/local/bin/mqtt2mystrom", "/etc/mqtt2mystrom.json" ]
```

## Configuration

The following configuration file is an example. Please replace the desired
values like the mqtt url and add your MyStrom Switch devices. Automatic
discovery is currently not available.

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

### Status messages

The current relay status will be published to `mystrom/relay/<SwitchName>` in
retained mode. The `val` will contain `0` if the switch is turned off and not
relaying power and `1` if the switch is turned on and relaying power.

With the interval of the polling configuration, normally every minute, the
current power usage is published to `mystrom/power/<SwitchName>`. It will
contain the currently used watt in the payload `val`.

### Control switch relay

To control the relay status of a switch, use on of the self explained topics
without any payload:
* `mystrom/set/<SwitchName>/on`
* `mystrom/set/<SwitchName>/off`

[MyStrom Switches]: https://mystrom.ch/de/wifi-switch/
