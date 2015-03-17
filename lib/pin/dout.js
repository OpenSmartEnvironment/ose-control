'use strict';

var O = require('ose').class(module).prepend('./index');

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Digital output pin type
 *
 * @readme
 * Setup of digital output pin.
 *
 * @class control.lib.pin.dout
 * @type extend
 */

// Public {{{1
exports.write = function(req, socket) {
  var that = this;

  if (this.pins.dummy) {
    this.update(req);
    O.link.close(socket);
    return;
  }

  this.type.write(this, req, function(err) {
    if (! O.link.canClose(socket)) return;
    if (err) {
      O.link.error(socket, err);
      return;
    }

    O.link.close(socket);
    return;
  });
  return;
};

