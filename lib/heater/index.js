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
    enabled: false
  };

  entry.onStates({
    'enabled': onEnabled,
    'value': onValue
  });

  if (entry.data.tariff) {
    entry.tariff = new Tariff(entry);
  } else {
    M.log.error(Ose.error(entry, 'INVALID_CONFIG', 'The heater entry can\'t be turned on without `data.tariff`.'));
  }

  entry.pin = new Pin(entry, entry.data.pin);
};

// }}}1
// Private {{{1
function onValue(entry, data) {  // {{{2
/**
 * Invoked on entry state change.
 *
 * @param this {Object} Entry
 */

//  console.log('HEATER ON VALUE', entry.identify(), data);

  if (data && ! (entry.state.enabled && entry.state.power)) {
    clearTimer(entry);
    turn(entry, 0);
  }
};

function onEnabled(entry, data) {  // {{{2
/**
 * Invoked on entry state change.
 *
 * @param this {Object} Entry
 */

//  console.log('HEATER ON ENABLED', entry.identify(), data);

  if (entry.state.power && data) {
    setupPower(entry, entry.state.power);
    return;
  }

  turn(entry, 0);
  clearTimer(entry);

  return;
};

function power(req, socket) {  // {{{2
/**
 * Command handler. Sets up heater power to specified value.
 *
 * @param this {Object} Context
 * @param this.entry {Object} Target entry.
 * @param req {Boolean | Number | String} Value between 0..1
 *
 * @method power
 */

//  console.log('HEATER ON POWER', req);

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
    Ose.link.error(socket, Ose.error(e, 'INVALID_REQ', req));
    return;
  }

  if (e.state.power === req) {
    Ose.link.close(socket);
    return;
  }

  e.setState({power: req});

  switch (req) {
  case 0:
    turn(e, 0);
    break;
  case 1:
    turn(e, 1);
    break;
  default:
    setupPower(e, req);
    Ose.link.close(socket);
    return;
  }

  clearTimer(e);

  Ose.link.close(socket);
  return;
};

function turn(entry, val) {  // {{{2
  if (! (entry.pin && entry.pin.link)) {
    M.log.error(Ose.error(entry, 'DISCONNECTED', 'Heater is not connected to the controller pin!'));
    return;
  }

  if (val && ! entry.state.enabled) {
    console.log('HEATER IS BANNED', entry.id);
//    M.log.error(Ose.error(entry, 'BANNED', 'Heater is banned!'));
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

  if (! entry.powerTimeout) {
    turn(entry, 1);
    entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * data);
  }

  function onTime() {
    if (entry.state.value) {
      turn(entry, 0);
      if (entry.state.power) {
        entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * (1 - data));
      } else {
        delete entry.powerTimeout;
      }
    } else {
      turn(entry, 1);
      entry.powerTimeout = setTimeout(onTime, M.consts.heaterTimeout * data);
    }
  }
};

// }}}1
