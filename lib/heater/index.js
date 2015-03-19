'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var Pin = O.class('./pin');
var Tariff = O.class('./tariff');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Heater kind
 *
 * @readme
 * [Entry kind] defining behaviour of heaters. Each heater establishes
 * a [link] to the `data.master` entry with a `registerPin()`
 * [command] and to an optional `data.tariff` entry to watch low and
 * high tariff switching.
 *
 * @aliases heater heaters heaterEntry
 * @class control.lib.heater
 * @extend ose.lib.kind
 * @type class
 */

/**
 * Controller entry identification object.
 *
 * The heater entry establishes a new link to the controller.
 *
 * @property data.master
 * @type String | Object
 */

/**
 * Master pin index
 *
 * Index of digital input pin on the master controller
 *
 * @property data.pin
 * @type String
 */

/**
 * Tariff entry identification object.
 *
 * If specified, the heater establishes a new link to the
 * `data.tariff` entry and gets controlled by it.
 *
 * @property data.tariff
 * @type String | Object
 */

// Public {{{1
exports.init = function() {  // {{{2
  this.on('power', power);
};

exports.homeInit = function(entry) {  // {{{2
  entry.state = {
    power: 0,
    enabled: false,
  };

  entry.on('remove', onRemove.bind(entry));

  entry.onStates({
    'enabled': onEnabled,
    'power': onPower,
    'value': onValue,
  });

  if (entry.data.tariff) {
    entry.tariff = new Tariff(entry);
  } else {
    O.log.error(O.error(entry, 'INVALID_CONFIG', 'The heater entry can\'t be turned on without `data.tariff`.'));
  }

  entry.pin = new Pin(entry, entry.data.pin);
};

// }}}1
// Private {{{1
function power(req, socket) {  // {{{2
/**
 * Command handler. Sets up heater power to specified value.
 *
 * @param req {Boolean | Number | String} Value between 0..1
 * @param [socket] {Object} Command response socket
 *
 * @method power
 * @commandHandler
 */

  var e = this.entry;

  switch (req) {
  case false:
  case 'off':
    req = 0;
    break;
  case true:
  case 'on':
    req = 1;
    break;
  }

  if (typeof req === 'string') {
    req = parseFloat(req);
  };

  if (
    (typeof req !== 'number') ||
    isNaN(req) ||
    (req < 0) ||
    (req > 1)
  ) {
    O.link.error(socket, O.error(e, 'Invalid arguments', req));
    return;
  }

  e.setState({power: req});
  O.link.close(socket);
  return;
};

function onRemove() {  // {{{2
  clearTimer(this);
};

function onPower(entry, data) {  // {{{2
  switch (data) {
  case 0:
    clearTimer(entry);
    turn(entry, 0);
    return;
  case 1:
    clearTimer(entry);
    turn(entry, 1);
    return;
  }

  if (entry.powerTimeout) {
    return;
  }

  setupTimer(entry, data);
  return;
};

function onValue(entry, data) {  // {{{2
  if (data && ! (entry.state.enabled && entry.state.power)) {
    clearTimer(entry);
    turn(entry, 0);
  }
};

function onEnabled(entry, data) {  // {{{2
  if (data && entry.state.power) {
    onPower(entry, entry.state.power);
    return;
  }

  if (! O.link.canSend(this)) return;

  turn(entry, 0);
  clearTimer(entry);
  return;
};

function turn(entry, val) {  // {{{2
  if (val === entry.state.value) {
    return;
  }

  if (! O.link.isOpened(entry.pin)) {
    O.log.error(O.error(entry, 'DISCONNECTED', 'Heater is not connected to the controller pin!'));
    return;
  }

  if (val && ! (entry.state.enabled && entry.state.power)) {
//    console.log('HEATER IS BANNED', entry.id);
    return;
  }

  console.log('HEATER TURN', val);

  O.link.send(entry.pin, 'write', val);
//  entry.pin.link.update(val);

  return;
};

function clearTimer(entry) {  // {{{2
  if (entry.powerTimeout) {
    clearTimeout(entry.powerTimeout);
    delete entry.powerTimeout;
  }
};

function setupTimer(entry, data) {  // {{{2
  if (! entry.state.enabled) {
    return;
  }

  if (entry.powerTimeout) {
    return;
  }

  turn(entry, 1);
  entry.powerTimeout = setTimeout(onTime, O.consts.heaterTimeout * data);
  return;

  function onTime() {  // {{{3
    delete entry.powerTimeout;
    data = entry.state.power;

    if (! (data && entry.state.enabled)) {
      turn(entry, 0);
      return;
    }

    if (entry.state.value) {
      entry.powerTimeout = setTimeout(onTime, O.consts.heaterTimeout * (1 - data));
      turn(entry, 0);
      return;
    }

    entry.powerTimeout = setTimeout(onTime, O.consts.heaterTimeout * data);
    turn(entry, 1);
    return;
  }

  // }}}3
};

// }}}1
