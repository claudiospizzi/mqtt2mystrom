#!/usr/bin/env node

const log = require('yalm');
const mqtt = require('mqtt');
const request = require('request');

const pkg = require('./package.json');
const cfg = require(process.argv[2] || './config.json');

let connected;

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

    connected = true;
    log.info('mqtt: connected ' + cfg.mqtt.url);

    cfg.mystrom.switchDevices.forEach(switchDevice => {
        mqttClient.subscribe(cfg.mqtt.name + '/set/' + switchDevice.name + '/#');
        log.info('mqtt: subscribe ' + cfg.mqtt.name + '/set/' + switchDevice.name + '/#');
    });
});

mqttClient.on('close', () => {

    if (connected) {
        connected = false;
        log.info('mqtt: disconnected ' + cfg.mqtt.url);
    }
});

mqttClient.on('error', err => {

    log.error('mqtt: error ' + err.message);
});

mqttClient.on('message', (topic, payload, msg) => {

    cfg.mystrom.switchDevices.forEach(switchDevice => {
        if ((cfg.mqtt.name + '/set/' + switchDevice.name + '/on') === topic) {
            setMyStromSwitch(switchDevice, 'on');
        }
        if ((cfg.mqtt.name + '/set/' + switchDevice.name + '/off') === topic) {
            setMyStromSwitch(switchDevice, 'off');
        }
    });
});

function setMyStromSwitch(switchDevice, mode) {

    switch (mode) {
        case 'on':
            url = 'http://' + switchDevice.address + '/relay?state=1';
            break;
        case 'off':
            url = 'http://' + switchDevice.address + '/relay?state=0';
            break;
        default:
            log.error('mystrom switch: error mode ' + mode + ' not supported');
            return;
    }

    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            log.info('mystrom switch: turn ' + switchDevice.address + ' ' + mode);
        }
        else {
            log.error('mystrom switch: error set mode ' + error);
        }
    });

    publishMqttStatus(switchDevice);
}

function getMyStromSwitch(switchDevice, successCallback) {

    request.get('http://' + switchDevice.address + '/report', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            device = JSON.parse(body);
            log.debug('mystrom switch: relay = ' + device.relay + ' / power = ' + device.power);
            successCallback(device);
        }
        else {
            log.error('mystrom switch: error get report ' + error);
        }
    });
}

function pollMyStromSwitch() {

    log.debug('mystrom switch: poll status');

    cfg.mystrom.switchDevices.forEach(switchDevice => {
        publishMqttStatus(switchDevice);
    });
}

function publishMqttStatus(switchDevice) {

    getMyStromSwitch(switchDevice, function(switchDeviceStatus) {

        ts = Date.now() / 1000;

        payloadRelay = { ts: ts, val: switchDeviceStatus.relay ? 1 : 0 };
        payloadPower = { ts: ts, val: switchDeviceStatus.power };

        mqttClient.publish(cfg.mqtt.name + '/relay/' + switchDevice.name, JSON.stringify(payloadRelay), { retain: true });
        log.info('mqtt: publish ' + cfg.mqtt.name + '/relay/' + switchDevice.name + ' ' + JSON.stringify(payloadRelay));

        mqttClient.publish(cfg.mqtt.name + '/power/' + switchDevice.name, JSON.stringify(payloadPower));
        log.info('mqtt: publish ' + cfg.mqtt.name + '/power/' + switchDevice.name + ' ' + JSON.stringify(payloadPower));
    });
}

setInterval(pollMyStromSwitch, cfg.mystrom.pollInterval * 1000);
