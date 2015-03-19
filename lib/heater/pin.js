'use strict';

var O = require('ose').class(module, C, 'ose/lib/entry/command');

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

  O.super.call(this,
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

exports.synced = function(state, data) {  // {{{2
/**
 * Synced handler
 *
 * @param state {Boolean}
 *
 * @method synced
 */

  this.entry.setState({synced: state});

  if (state) {
    this.update(data);
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
