'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var Pin = O.class('./pin');

/** Doc {{{1
 * @submodule control.distributor
 */

/**
 * @caption Digital input pin kind
 *
 * @readme
 * Kind defining digital input entries
 *
 * The `din` entry connects to the controller by creating a [link] to
 * the master controller pin.  The state of the `din` entry then
 * changes with the state of the physical pin on the controller side.
 *
 * @kind din
 * @class control.lib.din
 * @extend ose.lib.kind
 * @type singleton
 */

/**
 * Entry data object
 *
 * @property data
 * @type Object
 */

/**
 * Identification of entry representing a controller
 *
 * @property data.master
 * @type String | Object
 */

/**
 * The pin index of the corresponding pin on the controller.
 *
 * @property data.pin
 * @type String
 */

// Public {{{1
exports.homeInit = function(entry) {  // {{{2
  entry.state = {
    debounce: entry.data.debounce,
  };

  new Pin(entry);
};

// }}}1
