'use strict';

var O = require('ose').class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light channel-to-controller pin client socket
 *
 * @readme
 * Establishes a link for a channel to the `dval.master`
 * controller.
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
    throw O.error(this, 'Duplicit channel', name);
  }
  entry.channels[name] = this;
  this.name = name;

  if (typeof pin !== 'object') {
    pin = {
      index: pin,
    };
  }

  this.type = pin.type || 'pwm';

  O.super.call(this, entry, entry.dval.master, 'registerPin', {
    caption: entry.getCaption() + ' ' + name,
    entry: entry.identify(),
    index: pin.index,
    type: this.type,
    flavour: 'light',
  });
};

exports.synced = function(val, data) {  // {{{2
  if (val) {
    var s = {};
    s[this.name] = {
      synced: true,
      caps: data.caps,
      type: this.type,
    };
    this.entry.setState({channels: s});

    this.update(data);
  } else {
    O.log.error(data);

    var s = {};
    s[this.name] = {synced: false};
    this.entry.setState({channels: s});
  }
};

exports.update = function(req) {  // {{{2
/**
 * Invoked on controller pin change
 *
 * @param req {Object} Update request
 *
 * @method update
 * @handler
 */

//  console.log('LIGHT PIN UPDATE', req);

  if (
    (typeof req.value !== 'number') ||
    (req.value < 0) ||
    (req.value > 1) ||
    isNaN(req.value)
  ) {
    O.link.error(this, O.error(this, 'Invalid arguments', req));
    return;
  }

  var e = this.entry;

  var state = {};
  state[this.name] = {
    value: req.value,
    at: req.at,
    aim: req.aim,
    time: req.time,
  };

  e.setState({channels: state});
  return;
};

// }}}1
