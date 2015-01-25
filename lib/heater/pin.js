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
      caption: entry.getCaption(),
      entry: entry.identify(),
      index: pin,
      type: 'dout',
    }
  );
};

exports.error = function(err) {  // {{{2
  M.log.error(err);

  this.close();
};

exports.close = function(resp) {  // {{{2
  this.sync(false);

  M.log.notice('Heater link to master pin was permanently closed', {entry: this.entry.identify(), resp: resp});
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
