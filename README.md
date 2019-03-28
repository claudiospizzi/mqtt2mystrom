# mqtt2mystrom

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg?style=flat-square)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![npm](https://img.shields.io/npm/v/mqtt2mystrom.svg?style=flat-square)](https://www.npmjs.com/package/mqtt2mystrom)
[![travis](https://img.shields.io/travis/svrooij/mqtt2mystrom.svg?style=flat-square)](https://travis-ci.org/svrooij/mqtt2mystrom)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

This node.js application is a bridge between the [MyStrom Switches] and a mqtt
broker. The relay status and the current power usage is published to mqtt. The
relay state (on, off) can be controlled over mqtt.

## Installation

```bash
npm install -g mqtt2mystrom
```

## Usage

tbd

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
