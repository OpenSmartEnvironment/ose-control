'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light channel-to-controller pin client socket
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
  this.type = pin.type || 'pwm';

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
      caption: entry.getCaption() + ' ' + name,
      entry: entry.identify(),
      index: pin.index,
      type: this.type,
      flavour: 'light',
    }
  );
};

exports.error = function(err) {  // {{{2
  M.log.error(err);

  this.close();
};

exports.close = function(err, resp) {  // {{{2
  this.sync(false);

  M.log.notice('Light channel link to master pin was permanently closed', {entry: this.entry.identify(), resp: resp});
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
      caps: data.caps,
      type: this.type,
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
    Ose.link.error(this, Ose.error(this, 'INVALID_ARGS', req));
    return;
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
  return;
};

// }}}1
