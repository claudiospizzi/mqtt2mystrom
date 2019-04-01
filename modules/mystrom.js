const request = require('request');

function getSwitchStatus(address, callback) {

    var url = 'http://' + address + '/report';

    request.get(url, (error, response, body) => {

        if (error) {
            callback(error, null);
        }
        else if (response.statusCode != 200) {
            callback('Request failed with http status code ' + response.statusCode, null);
        }
        else {
            var bodyData = JSON.parse(body);
            callback(null, { address: address, relay: bodyData.relay, power: bodyData.power });
        }
    });
}

function setSwitchRelay(address, state, callback) {

    var url = 'http://' + address + '/relay?state=' + state;

    request.get(url, (error, response, body) => {

        if (error) {
            callback(error);
        }
        else if (response.statusCode != 200) {
            callback('Request failed with http status code ' + response.statusCode);
        }
        else {
            callback(null);
        }
    });
}

function setSwitchRelayOn(address, callback) {

    setSwitchRelay(address, '1', callback);
}

function setSwitchRelayOff(address, callback) {

    setSwitchRelay(address, '0', callback);
}

module.exports.getSwitchStatus = getSwitchStatus;
module.exports.setSwitchRelayOn = setSwitchRelayOn;
module.exports.setSwitchRelayOff = setSwitchRelayOff;
