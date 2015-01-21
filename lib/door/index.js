'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

var Pin = M.class('./pin');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Door kind
 *
 * @readme

 * Each [entry] of this kind establishes a [link] to the `data.master`
 * controller entry with `type: "din"`. Entry state is changed
 * depending on the incoming data, and the `open` or `close` events
 * are fired. These events can be listened for, and appropriate
 * actions can be taken.
 *
 * @aliases door doors doorEntry
 * @class control.lib.door
 * @extend ose.lib.kind
 * @type singleton
 */

/**
 * Controller entry identification object.
 *
 * The switch entry establishes a new link to this controller.
 *
 * @property data.master
 * @type String | Object
 */

/**
 * Master pin index
 *
 * Index of digital input pin on the master controller
 *
 * @property data.pin
 * @type String
 */

/**
 * Debounce timeout
 *
 * Defines debounce timeout of the digital input in milliseconds.
 *
 * The default value is `M.consts.switchDebounce`.
 *
 * @property data.debounce
 * @type Number
 */

/**
 * Current switch state value
 *
 * @property state.value
 * @type Number (0, 1)
 */

/**
 * Timestamp of the last switch change.
 *
 * @property state.at
 * @type Number
 */

/**
 * Debounce timeout
 *
 * Defines debounce timeout of the digital input in milliseconds. The
 * value is taken from `data.debounce`.
 *
 * @property state.debounce
 * @type Number
 */

/**
 * Open event
 *
 * Fired when a "door open" event is detected.
 *
 * @event open
 */

/**
 * Close event
 *
 * Fired when a "door close" event is detected.
 *
 * @event close
 */

// Public {{{1
exports.homeInit = function(entry) {  // {{{2
  entry.state = {
    debounce: entry.data.debounce || M.consts.switchDebounce,
  };

  new Pin(entry);
};

// }}}1
