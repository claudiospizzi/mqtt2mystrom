const request = require('request');

/**
 * Get the current MyStrom Switch status.
 * @param {string}                   address  IP address of the MyStrom Switch.
 * @param {function(string, string)} callback Callback with the response object.
 */
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

/**
 * Set the relay state of the MyStrom switch to on or off.
 * @param {string}           address  IP address of the MyStrom Switch.
 * @param {int}              state    Relay state: 0 = off, 1 = on.
 * @param {function(string)} callback Callback after the state was set.
 */
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

/**
 * Set the MyStrom Switch relay state to on.
 * @param {string}           address  IP address of the MyStrom Switch.
 * @param {function(string)} callback Callback after the state was set.
 */
function setSwitchRelayOn(address, callback) {

    setSwitchRelay(address, '1', callback);
}

/**
 * Set the MyStrom Switch relay state to off.
 * @param {string}           address  IP address of the MyStrom Switch.
 * @param {function(string)} callback Callback after the state was set.
 */
function setSwitchRelayOff(address, callback) {

    setSwitchRelay(address, '0', callback);
}

// Node.JS module function export
module.exports.getSwitchStatus = getSwitchStatus;
module.exports.setSwitchRelayOn = setSwitchRelayOn;
module.exports.setSwitchRelayOff = setSwitchRelayOff;
