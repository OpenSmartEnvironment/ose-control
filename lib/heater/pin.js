'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Heater-to-controller pin client socket
 *
 * @readme
 * Establishes a [link] to the `dval.master` [controller pin]
 * `dval.pin` with `type: "dout"`. The master can be a [Raspberry Pi],
 * for example.
 *
 * @class control.lib.heater.pin
 * @type class
 */

// Public {{{1
function init(entry, pin) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  O.inherited(this)(
    entry,
    entry.dval.master,
    'registerPin',
    {
      index: pin,
      type: 'dout',
      cease: 0,  // TODO
    }
  );
};

exports.synced = function(state, val) {  // {{{2
  this.entry.setState({synced: state});

  if (state) {
    this.update(val);
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
