'use strict';

var O = require('ose').class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Door-to-controller pin client socket
 *
 * @readme
 * Establishes a link to the `data.master` controller pin `data.pin`
 * with `type: "din"`. The controller can be a [Raspberry Pi] or [OSE
 * Main board], for example.
 *
 * @class control.lib.door.pin
 * @type class
 */

// Public {{{1
function C(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Door entry
 *
 * @method constructor
 */

  O.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      type: 'din',
      index: entry.data.pin,
      debounce: entry.state.debounce,
    }
  );
};

exports.synced = function(state, data) {  // {{{2
/**
 * Synced handler
 *
 * @param req {*} Request data
 *
 * @method synced
 */

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

  if ('value' in this.entry.state) {
    if (req.value) {
      this.entry.emit('open', req);
    } else {
      this.entry.emit('close', req);
    }
  }

  this.entry.setState({
    value: req.value,
    at: req.at
  });
};

// }}}1
