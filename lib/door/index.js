'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'door');

var Pin = O.getClass('./pin');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Door kind
 *
 * @readme
 * Each [entry] of this kind establishes a [link] to the `dval.master`
 * controller entry with `type: "din"`. Entry sval is changed
 * depending on the incoming data, and the `open` or `close` events
 * are fired. These events can be listened for, and appropriate
 * actions can be taken.
 *
 * @aliases door doors doorEntry
 * @kind door
 * @class control.lib.door
 * @extend ose.lib.kind
 * @type singleton
 */

/**
 * Controller entry identification object.
 *
 * The switch entry establishes a new link to this controller.
 *
 * @property dval.master
 * @type String | Object
 */

/**
 * Master pin index
 *
 * Index of digital input pin on the master controller
 *
 * @property dval.pin
 * @type String
 */

/**
 * Debounce timeout
 *
 * Defines debounce timeout of the digital input in milliseconds.
 *
 * The default value is `O.consts("control").switchDebounce`.
 *
 * @property dval.debounce
 * @type Number
 */

/**
 * Current switch state value
 *
 * @property sval.value
 * @type Number (0, 1)
 */

/**
 * Timestamp of the last switch change.
 *
 * @property sval.at
 * @type Number
 */

/**
 * Debounce timeout
 *
 * Defines debounce timeout of the digital input in milliseconds. The
 * value is taken from `dval.debounce`.
 *
 * @property sval.debounce
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
exports.role = ['pin', 'hole'];

exports.homeInit = function(entry) {  // {{{2
  entry.sval = {
    debounce: entry.dval.debounce || O.consts('control').switchDebounce,
  };

  new Pin(entry);
};

