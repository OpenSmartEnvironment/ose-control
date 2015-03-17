'use strict';

var O = require('ose').module(module);

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

//  console.log('REGISTER', req);

  if (req.path) {
    if (! req.path.match(/\/$/)) {
      req.path += '/';
    }
  }

  var r = O.new((req.path || './') + (req.flavour || req.type))();
  r.init(this.entry.pins, req, socket);
};

exports.emulatePin = function(req, socket) {  // Update PIC PIN value. {{{2
  var pin = this.entry.pins.pins[req.pin];

  if (! pin) {
    O.link.error(socket, O.error(this, 'Pin was not found', req));
    return;
  }

  pin.update(req.value);
  O.link.close(socket);
  return;
};

exports.updatePin = function(req, socket) {  // Update PIC PIN value. {{{2
  var pin = this.entry.pins.pins[req.index];

  if (! pin) {
    O.link.error(socket, O.error(this, 'Pin was not found', req));
    return;
  }

  pin.write(req.value);
  O.link.close(socket);
  return;
};

// }}}1
