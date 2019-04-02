#!/usr/bin/env node

const log = require('yalm');
const mqtt = require('mqtt');
const request = require('request');

const mystrom = require('./modules/mystrom.js');

const pkg = require('./package.json');
const cfg = require(process.argv[2] || './config.json');

let mqttConnected;

log.setLevel(cfg.log);
log.info(pkg.name + ' ' + pkg.version + ' starting');

const mqttClient = mqtt.connect(
    cfg.mqtt.url, {
        will: { topic: cfg.mqtt.name + '/connected', payload: '0', retain: true },
        rejectUnauthorized: cfg.mqtt.secure
    }
);

mqttClient.on('connect', () => {

    mqttClient.publish(cfg.mqtt.name + '/connected', '2', { retain: true });

    mqttConnected = true;
    log.info('mqtt: connected ' + cfg.mqtt.url);

    cfg.mystrom.switchDevices.forEach(switchDevice => {
        mqttClient.subscribe(cfg.mqtt.name + '/set/' + switchDevice.name + '/#');
        log.info('mqtt: subscribe ' + cfg.mqtt.name + '/set/' + switchDevice.name + '/#');
    });
});

mqttClient.on('close', () => {

    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt: disconnected ' + cfg.mqtt.url);
    }
});

mqttClient.on('error', err => {

    log.error('mqtt: error ' + err.message);
});

mqttClient.on('message', (topic, payload, msg) => {

    cfg.mystrom.switchDevices.forEach(switchDevice => {
        if ((cfg.mqtt.name + '/set/' + switchDevice.name + '/on') === topic) {
            mystrom.setSwitchRelayOn(switchDevice.address, (error) => {
                if (error) {
                    log.error(error);
                }
                else {
                    log.info('mystrom switch: turn ' + switchDevice.address + ' on');
                }
            });
        }
        if ((cfg.mqtt.name + '/set/' + switchDevice.name + '/off') === topic) {
            mystrom.setSwitchRelayOff(switchDevice.address, (error) => {
                if (error) {
                    log.error(error);
                }
                else {
                    log.info('mystrom switch: turn ' + switchDevice.address + ' off');
                }
            });
        }
    });
});

function pollMyStromSwitch() {

    log.debug('mystrom switch: poll status');

    cfg.mystrom.switchDevices.forEach(switchDevice => {

        mystrom.getSwitchStatus(switchDevice.address, (error, response) => {

            payloadRelay = { ts: Date.now(), val: response.relay ? 1 : 0 };

            mqttClient.publish(cfg.mqtt.name + '/relay/' + switchDevice.name, JSON.stringify(payloadRelay), { retain: true });
            log.info('mqtt: publish ' + cfg.mqtt.name + '/relay/' + switchDevice.name + ' ' + JSON.stringify(payloadRelay));

            payloadPower = { ts: Date.now(), val: response.power };

            mqttClient.publish(cfg.mqtt.name + '/power/' + switchDevice.name, JSON.stringify(payloadPower));
            log.info('mqtt: publish ' + cfg.mqtt.name + '/power/' + switchDevice.name + ' ' + JSON.stringify(payloadPower));
        });
    });
}

setInterval(pollMyStromSwitch, cfg.mystrom.pollInterval * 1000);
