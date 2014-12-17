'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

var Pin = M.class('./pin');

/** Doc {{{1
 * @submodule control.distributor
 */

/**
 * @caption Digital input pin kind
 *
 * @readme
 * Kind defining digital input entries
 *
 * The `din` entry connects to the controller by sending a
 * `registerPin()` command with a client socket. The state of the
 * `din` entry then changes with the state of the physical pin on the
 * controller side.
 *
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
 * Identification of entry representing a physical device.
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

  /*
  entry.onActions(Actions);

  entry.action('registerPin',  // Register din at master.
    {
      index: entry.data.pin,
      type: 'din',
      debounce: entry.state.debounce,
//      caption: entry.getCaption(),
    },
    entry.data.master
  )
    .logError()
  ;
  */
};

// }}}1
