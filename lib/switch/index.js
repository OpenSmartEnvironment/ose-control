'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('control', 'switch');

var Consts = O.consts('control');
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
 * Each [entry] of this kind establishes a [link] to the `dval.master`
 * controller entry with `flavour: "switch"`.
 *
 * `press`, `release`, `tap` and `hold` events are fired on the entry,
 * and the `sval` of the entry is updated depending on controller pin
 * changes. These events can be listened for, and appropriate actions
 * can be taken.
 *
 * It is also possible to establish a new [link] to a switch as a
 * client socket with the "relay" command. The events listed above are
 * then relayed to the client socket.
 *
 * For example, a [light entry] connects to a switch (if defined in
 * `light.dval.switch`) as a client socket and is turned on or off
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
 * Defines the debounce timeout of the digital input in
 * milliseconds. The value is taken from `dval.debounce`.
 *
 * @property sval.debounce
 * @type Number
 */

/**
 * Hold timeout
 *
 * Defines the hold timeout of the switch in milliseconds. The value is
 * taken from `dval.hold`.
 *
 * @property sval.hold
 * @type Number
 */

/**
 * Tap timeout
 *
 * Defines the tap timeout of the switch in milliseconds. The value is
 * taken from `dval.tap`.
 *
 * @property sval.tap
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
exports.addDdes();
exports.ddes.add('name', 'text', {required: true});
exports.ddes.add('parent', 'lookup');
exports.ddes.add('master', 'lookup', {  // {{{2
  view: 'list',
  ident: {
    schema: 'control',
  },
  filter: {
    pins: true,
  },
});
/**
 * Master controller entry identification object.
 *
 * The switch entry establishes a new link to exports controller.
 *
 * @property dval.master
 * @type String | Object
 */

exports.ddes.add('pin', 'text');  // {{{2
/**
 * Master pin index
 *
 * Index of digital input pin on the master controller
 *
 * @property dval.pin
 * @type String
 */

exports.ddes.add('debounce', 'millitime');  // {{{2
/**
 * Debounce timeout
 *
 * Defines debounce timeout of the digital input in milliseconds.
 *
 * Default value is `Consts.switchDebounce`.
 *
 * @property dval.debounce
 * @type Number
 */

exports.ddes.add('tap', 'millitime');  // {{{2
/**
 * Tap timeout
 *
 * Defines tap timeout of the switch in milliseconds.
 *
 * Default value is `Consts.switchTap`.
 *
 * @property dval.tap
 * @type Number
 */

exports.ddes.add('hold', 'millitime');  // {{{2
/**
 * Hold timeout
 *
 * Defines hold timeout of the switch in milliseconds.
 *
 * Default value is `Consts.switchHold`.
 *
 * @property dval.hold
 * @type Number
 */

exports.on('relay', O.link.bindResp(O, './relay'));  // {{{2
/**
 * Create a response socket relaying switch events to the client.
 *
 * @method relay
 * @handler
 */

exports.homeInit = function(entry) {  // {{{2
  entry.setState({
    debounce: entry.dval.debounce || Consts.switchDebounce,
    tap: entry.dval.tap || Consts.switchTap,
    hold: entry.dval.hold || Consts.switchHold,
  });

  entry.on('dpatch', onDpatch.bind(entry));

  if (entry.dval.master && entry.dval.pin) {
    entry.socket = new Pin(entry);
  }
};

// Event handlers {{{1
function onDpatch(patch) {  // {{{2
/*
 * `this` is bound to entry
 */

  var c = false;
  if ('debounce' in patch) {
    c = true;
    this.setState({debounce: patch.debounce === null ? Consts.switchDebounce : patch.debounce});
  }
  if ('tap' in patch) {
    c = true;
    this.setState({tap: patch.tap === null ? Consts.switchTap : patch.tap});
  }
  if ('hold' in patch) {
    c = true;
    this.setState({hold: patch.hold === null ? Consts.switchHold : patch.hold});
  }
  if ('pin' in patch) {
    c = true;
//    this.socket.data.index = patch.pin;
  }
  if ('master' in patch) {
    c = true;
//    this.socket.target = patch.master;
  }

  if (! c) return;

  if (this.socket) {
    delete this.socket.target;
    O.link.close(this.socket);
    delete this.socket;
  }

  if (this.dval.master && this.dval.pin) {
    this.socket = new Pin(this);
  }

  return;
}

// }}}1
