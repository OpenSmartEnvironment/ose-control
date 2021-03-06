'use strict';

const O = require('ose')(module);

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
 * Register pin
 *
 * @param req {Object} Client request
 * @param req.index {Number|String} Pin index
 * @param req.type {String} [Pin type]
 * @param [req.flavour] {String} [Pin flavour]
 * @param [req.caption] {String} Pin caption
 * @param [req.entry] {Object} Client entry identification
 * @param [req.path] {String} Path to requested flavour class
 *
 * @param socket {Object} Slave socket
 *
 * @method registerPin
 * @handler
 */

//  console.log('REGISTER PIN', this.entry.toString(), req);

  var pin = O.new((req.path || './') + (req.flavour || req.type))();

  pin.init(this.entry.pins, req, socket);
};

exports.emulatePin = function(req, socket) {  // {{{2
/**
 * Emulates change of pin state on the controller
 *
 * @param req {Object} Client request
 * @param req.index {Number|Object} Pin index
 * @param req.value {Number} Requested value
 *
 * @param socket
 *
 * @method emulatePin
 * @handler
 */
//  console.log('EMULATE PIN', req.index);

  var pin = this.entry.pins.pins[req.index];

  if (! pin) {
    O.link.error(socket, O.error(this.entry, 'Pin was not found', req));
    return;
  }

  pin.update(req.value);
  O.link.close(socket);
  return;
};

exports.writePin = function(req, socket) {  // {{{2
/**
 * Changes physical pin state
 *
 * @param req {Object} Client request
 * @param req.index {Number|Object} Pin index
 * @param req.value {Number} Requested value
 *
 * @param socket {Object}
 *
 * @method writePin
 * @handler
 */

  var pin = this.entry.pins.pins[req.index];

  if (! pin) {
    return O.link.error(socket, this, 'Pin was not found', req);
  }

  if (! pin.write) {
    return O.link.error(socket, this, 'Pin can\'t be written to', req);
  }

  return pin.write(req.value, socket);
};

