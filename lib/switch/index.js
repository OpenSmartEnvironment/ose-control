'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var Relay = O.class('./relay');
var Pin = O.class('./pin');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Switch kind
 *
 * @readme
 * Each switch is a digital input that has two logical values: `0` or `1`.
 *
 * Each [entry] of this kind establishes a [link] to the `data.master`
 * controller entry with `flavour: "switch"`.
 *
 * `press`, `release`, `tap` and `hold` events are fired on the entry,
 * and the state of the entry is updated depending on controller pin
 * changes. These events can be listened for, and appropriate actions
 * can be taken.
 *
 * It is also possible to establish a new [link] to a switch as a
 * client socket with the "relay" command. The events listed above are
 * then relayed to the client socket.
 *
 * For example, a [light entry] connects to a switch (if defined in
 * `light.data.switch`) as a client socket and is turned on or off
 * depending on pressing the switch.
 *
 * Currently, only momentary switches (push-to-make) are
 * supported. Support for all other kinds of switches is planned.
 *
 * @aliases switch switchEntry
 * @kind switch
 * @class control.lib.switch
 * @extend ose.lib.kind
 * @type class
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
 * Default value is `O.consts.switchDebounce`.
 *
 * @property data.debounce
 * @type Number
 */

/**
 * Hold timeout
 *
 * Defines hold timeout of the switch in milliseconds.
 *
 * Default value is `O.consts.switchHold`.
 *
 * @property data.hold
 * @type Number
 */

/**
 * Tap timeout
 *
 * Defines tap timeout of the switch in milliseconds.
 *
 * Default value is `O.consts.switchTap`.
 *
 * @property data.tap
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
 * Defines the debounce timeout of the digital input in
 * milliseconds. The value is taken from `data.debounce`.
 *
 * @property state.debounce
 * @type Number
 */

/**
 * Hold timeout
 *
 * Defines the hold timeout of the switch in milliseconds. The value is
 * taken from `data.hold`.
 *
 * @property state.hold
 * @type Number
 */

/**
 * Tap timeout
 *
 * Defines the tap timeout of the switch in milliseconds. The value is
 * taken from `data.tap`.
 *
 * @property state.tap
 * @type Number
 */

/**
 * Press event
 *
 * Fired when a switch press is detected.
 *
 * @event press
 */

/**
 * Release event
 *
 * Fired when a switch release is detected.
 *
 * @event release
 */

/**
 * Tap event
 *
 * Fired when a switch tap is detected.
 *
 * @param count Tap count within tap timeout.
 *
 * @event tap
 */

/**
 * Hold event
 *
 * Fired when a switch hold is detected.
 *
 * @event hold
 */

// Public {{{1
exports.init = function() {  // {{{2
  this.on('relay', relay);  // TODO: Simpler solution is avaliable - bind socket

  this.data = O.new('ose/lib/field/object')();
  this.data.text('name');
  this.data.lookup('master');
  this.data.text('pin');
};

exports.homeInit = function(entry) {  // {{{2
  entry.state = {
    debounce: entry.data.debounce || O.consts.switchDebounce,
    tap: entry.data.tap || O.consts.switchTap,
    hold: entry.data.hold || O.consts.switchHold,
  };

  entry.on('data', onData.bind(entry));

  entry.socket = new Pin(entry);
};

// }}}1
// Event handlers {{{1
function onData(patch) {  // {{{2
  var c = false;
  if ('pin' in patch) {
    c = true;
    this.socket.data.index = patch.pin;
  }
  if ('master' in patch) {
    c = true;
    this.socket.target = patch.master;
  }

  if (c) {
    O.link.close(this.socket);
  }
}

// }}}1
// Private {{{1
function relay(req, socket) {
  new Relay(this.entry, socket);
};

// }}}1
