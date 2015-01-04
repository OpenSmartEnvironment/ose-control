'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

var Pin = M.class('./pin');
var Tariff = M.class('./tariff');

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
    enabled: false,
  };

  entry.onStates({
    'enabled': onEnabled,
    'power': onPower,
    'value': onValue,
  });

  if (entry.data.tariff) {
    entry.tariff = new Tariff(entry);
  } else {
    M.log.error(Ose.error(entry, 'INVALID_CONFIG', 'The heater entry can\'t be turned on without `data.tariff`.'));
  }

  entry.pin = new Pin(entry, entry.data.pin);

  entry.on('remove', onRemove.bind(entry));
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
    Ose.link.error(socket, Ose.error(e, 'INVALID_ARGS', req));
    return;
  }

  e.setState({power: req});
  Ose.link.close(socket);
  return;
};

function onRemove() {  // {{{2
  clearTimer(this);
  turn(0);
};

function onPower(entry, data) {  // {{{2
  switch (data) {
  case 0:
  case 1:
    clearTimer(entry);
    turn(entry, data);
    return;
  }

  setupPower(entry, data);
  return;
};

function onValue(entry, data) {  // {{{2
  if (data && ! (entry.state.enabled && entry.state.power)) {
    clearTimer(entry);
    turn(entry, 0);
  }
};

function onEnabled(entry, data) {  // {{{2
  if (entry.state.power && data) {
    turn(entry, 1);
    setupPower(entry, entry.state.power);
    return;
  }

  turn(entry, 0);
  clearTimer(entry);
  return;
};

function turn(entry, val) {  // {{{2
  if (val === entry.state.value) {
    return;
  }

  if (! (entry.pin && entry.pin.link)) {
    M.log.error(Ose.error(entry, 'DISCONNECTED', 'Heater is not connected to the controller pin!'));
    return;
  }

  if (val && (! (entry.state.enabled && entry.state.power))) {
//    console.log('HEATER IS BANNED', entry.id);
    return;
  }

  entry.pin.link.update(val);
  return;
};

function clearTimer(entry) {  // {{{2
  if (entry.powerTimeout) {
    clearTimeout(entry.powerTimeout);
    delete entry.powerTimeout;
  }
};

function setupPower(entry, data) {  // {{{2
  if ((data <= 0) || (data > 1)) {
    throw Ose.error(entry, 'INVALID_ARGS', 'Power must be: `0 < data <= 1`', data);
  }

  if (entry.powerTimeout || ! entry.state.enabled) {
    return;
  }

  turn(entry, 1);
  entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * data);
  return;

  function onTime() {  // {{{3
    delete entry.powerTimeout;
    data = entry.state.power;

    if (! (data && entry.state.enabled)) {
      turn(entry, 0);
      return;
    }

    if (entry.state.value) {
      entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * (1 - data));
      turn(entry, 0);
      return;
    }

    entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * data);
    turn(entry, 1);
    return;
  }

  // }}}3
};

// }}}1
