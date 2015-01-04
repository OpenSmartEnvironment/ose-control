'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Heater-to-controller pin client socket
 *
 * @readme
 * Establishes a [link] to the `data.master` [controller pin]
 * `data.pin` with `type: "dout"`. The master can be a [Raspberry Pi]
 * or [OSE Main board], for example.
 *
 * @class control.lib.heater.pin
 * @type class
 */

// Public {{{1
function C(entry, pin) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  M.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      index: pin,
      type: 'dout',
    }
  );
};

exports.end = function(err, resp) {  // {{{2
/**
 * Broken link handler
 *
 * @param err {Object} [Error] instance
 * @param resp {Object} Response data
 *
 * @method end
 */

//  console.log('SWITCH LINK END');

  this.entry.setState({synced: false});

  if (err) {
    M.log.error(err);
  } else {
    M.log.notice('Heater link to master pin was permanently closed', resp);
  }
};

exports.sync = function(value) {  // {{{2
/**
 * Sync handler
 *
 * @param value {Boolean}
 *
 * @method sync
 */

  this.entry.setState({synced: value});

  if (this.link) {
    this.link.read();
  }
};

exports.update = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 * @param req.value {Number} (0, 1) Current pin state
 * @param req.at {Number} Timestamp of the update
 *
 * @method update
 */

//  console.log('HEATER UPDATE', req);

  this.entry.setState({
    value: req.value,
    at: req.at
  });
};

// }}}1
