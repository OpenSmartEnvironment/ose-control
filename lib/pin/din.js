'use strict';

var O = require('ose').class(module).prepend('./index');

/** Doc
 * @submodule control.pin
 */

/**
 * @caption Digital input pin response socket
 *
 * @readme
 * Setup of digital input pin.
 *
 * @class control.lib.pin.din
 * @type extend
 */

exports.update = function(val) {
/**
 * Called on change of physical pin state
 *
 * @param val {Number} New value
 *
 * @method update
 * @internal
 */

  val = val ? 1 : 0;

  var s = {};
  s[this.index] = {
    at: Date.now(),
    raw: val,
  };
  this.pins.entry.setState({pins: s});

  if (! O.link.canSend(this)) return;

  O.link.send(this, 'update', {
    value: val,
    at: s[this.index].at,
  });
  return;
};

