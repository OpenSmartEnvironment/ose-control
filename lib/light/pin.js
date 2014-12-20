'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light chanell-to-controller pin client socket
 *
 * @readme
 * Establishes a link for a channel to the `data.master`
 * controller. The controller can be an [OSE PWM board], for example.
 *
 * @class control.lib.light.pin
 * @type class
 */

// Public {{{1
function C(entry, name, pin) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  if (name in entry.channels) {
    throw Ose.error(this, 'DUPLICIT_CHANNEL', name);
  }
  entry.channels[name] = this;
  this.name = name;

  if (typeof pin !== 'object') {
    pin = {
      index: pin,
    };
  }

  M.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      index: pin.index,
      type: pin.type || 'pwm',
      flavour: 'light',
    }
  );
};

exports.sync = function(state, data) {  // {{{2
/**
 * Sync handler
 *
 * @param state {Boolean} Whether this socket is synced
 * @param [data] {Object} Optional open data
 *
 * @method sync
 */

//  console.log('LIGHT PIN OPENED', data);

  if (data) {
    var s = {};
    s[this.name] = {
      caps: data.caps
    };
    this.entry.setState({channels: s});

    this.steps = data.caps.pwm;
    this.link.read();
  }
};

exports.update = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method update
 */

//  console.log('LIGHT PIN UPDATE', req);

  if (
    (typeof req.value !== 'number') ||
    (req.value < 0) ||
    (req.value > 1) ||
    isNaN(req.value)
  ) {
    Ose.link.error(Ose.error(this, 'invalidValue', req));
  }

  var e = this.entry;

  var state = {};
  state[this.name] = {
    value: req.value,
    at: req.at,
    aim: typeof req.aim === 'number' ? req.aim : null,
    time: req.time || null,
  };

  e.setState({channels: state});
};

// }}}1
