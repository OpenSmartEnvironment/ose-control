'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('control', 'heater');

var Consts = O.consts('control');
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
 * a [link] to the `dval.master` entry and to an optional
 * `dval.tariff` entry to watch low and high tariff switching.
 *
 * @aliases heater heaters heaterEntry heaterEntryKind
 * @kind heater
 * @class control.lib.heater
 * @extend ose.lib.kind
 * @type class
 */

/**
 * Controller entry identification
 *
 * The heater entry establishes a new link to the controller.
 *
 * @property dval.master
 * @type String | Object
 */

/**
 * Master pin index
 *
 * Index of digital input pin on the master controller
 *
 * @property dval.pin
 * @type String
 */

/**
 * Tariff entry identification
 *
 * If specified, the heater establishes a new link to the
 * `dval.tariff` entry and gets controlled by it.
 *
 * @property dval.tariff
 * @type String | Object
 */

// Public {{{1
exports.role = ['pin', 'heater'];

exports.ddef = O.new('ose/lib/orm/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('parent')  // {{{3
    .detail(10.5)
    .parent

  .entry('master')  // {{{3
    .detail(11)
    .parent

  .text('pin')  // {{{3
    .detail(12)
    .parent

  .entry('tariff')  // {{{3
    .detail(13)
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/orm/object')()  // {{{2
  .integer('power')  // {{{3
    .params({
      unit: '%',
      min: 0,
      max: 1,
    })
    .detail(1, {post: 'power'})
    .parent

  .boolean('value')  // {{{3
    .params({readonly: true})
    .detail(1)
    .parent

  .boolean('enabled')  // {{{3
    .params({readonly: true})
    .detail(2)
    .parent

  .boolean('synced')  // {{{3
    .params({readonly: true})
    .detail(3)
    .parent

  // }}}3
;

exports.on('power', function(req, socket) {  // {{{2
/**
 * Sets up heater power to specified value.
 *
 * @param req {Boolean | Number | String} Value between 0..1
 * @param [socket] {Object} Command response socket
 *
 * @method power
 * @handler
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
    O.link.error(socket, O.error(e, 'INVALID_ARGS', req));
    return;
  }

  e.setState({power: req});
  O.link.close(socket);
  return;
});

exports.homeInit = function(entry) {  // {{{2
  entry.sval = {
    power: 0,
    enabled: false,
  };

  entry.on('remove', onRemove.bind(entry));

  entry.onStates({
    'enabled': onEnabled,
    'power': onPower,
    'value': onValue,
  });

  if (entry.dval.tariff) {
    entry.tariff = new Tariff(entry);
  } else {
    O.log.error(entry, 'INVALID_CONFIG', 'The heater entry can\'t be turned on without `dval.tariff`.');
  }

  entry.pin = new Pin(entry, entry.dval.pin);
};

exports.layout('listItem', {  // {{{2
  displayLayout: function() {
    this.addClass('row')
      .span((this.entry.sval.value ? 'On' : 'Off') + ' / ' + Math.trunc(this.entry.sval.power * 100) + ' %')
      .find('h3').addClass('stretch')
    ;
  },
  patch: function(val) {
    if (! val) return;
    val = val.spatch;

    if (val === null) {
      this.find('span').text();
      return;
    }

    if (! val) return;

    if (('value' in val) || ('power' in val)) {
      this.find('span').text((this.entry.sval.value ? 'On' : 'Off') + ' / ' + Math.trunc(this.entry.sval.power * 100) + ' %');
    }
  },
});

// Private {{{1
function onRemove() {  // {{{2
  clearTimer(this);
};

function onPower(entry, val) {  // {{{2
  switch (val) {
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

  setupTimer(entry, val);
  return;
};

function onValue(entry, val) {  // {{{2
  if (val && ! (entry.sval.enabled && entry.sval.power)) {
    clearTimer(entry);
    turn(entry, 0);
  }
};

function onEnabled(entry, val) {  // {{{2
  if (val && entry.sval.power) {
    onPower(entry, entry.sval.power);
    return;
  }

  turn(entry, 0);
  clearTimer(entry);
  return;
};

function turn(entry, val) {  // {{{2
  if (val === entry.sval.value) {
    return;
  }

  if (! O.link.isOpened(entry.pin)) {
//    O.log.error(entry, 'DISCONNECTED', 'Heater is not connected to the controller pin!');
    return;
  }

  if (val && ! (entry.sval.enabled && entry.sval.power)) {
//    console.log('HEATER IS BANNED', entry.id);
    return;
  }

//  console.log('HEATER TURN', val);

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

function setupTimer(entry, val) {  // {{{2
  if (! entry.sval.enabled) {
    return;
  }

  if (entry.powerTimeout) {
    return;
  }

  turn(entry, 1);
  entry.powerTimeout = setTimeout(onTime, Consts.heaterTimeout * val);
  return;

  function onTime() {  // {{{3
    delete entry.powerTimeout;
    val = entry.sval.power;

    if (! (val && entry.sval.enabled)) {
      turn(entry, 0);
      return;
    }

    if (entry.sval.value) {
      entry.powerTimeout = setTimeout(onTime, Consts.heaterTimeout * (1 - val));
      turn(entry, 0);
      return;
    }

    entry.powerTimeout = setTimeout(onTime, Consts.heaterTimeout * val);
    turn(entry, 1);
    return;
  }

  // }}}3
};

