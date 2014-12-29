'use strict';

var Ose = require('ose');
var M = Ose.module(module);

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Pin list commands
 *
 * @readme
 * Commands that are registered on [entry kinds] creating a list of
 * pins for their [entries].
 *
 * @class control.lib.pin.commands
 * @type extend
 */

// Public {{{1
exports.registerPin = function(req, socket) {  // {{{2
/**
 * [Command handler]
 * 
 * @param req {Object} Request relayed to [pin list] `register`
 * @param socket {Object} Slave socket
 *
 * @method registerPin
 */

  this.entry.pins.register(req, socket);
};

exports.updatePin = function(req, socket) {  // Update PIC PIN value. {{{2
  var pin = this.entry.pins.pins[req.index];

  if (! pin) {
    Ose.link.error(socket, Ose.error(this, 'PIN_NOT_FOUND', req));
    return;
  }

  pin.type.write(pin, req.value);
  Ose.link.close(socket);
  return;
};

// }}}1
