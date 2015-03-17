'use strict';

var O = require('ose').class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Switch-to-controller client socket
 *
 * @readme
 * Establishes a link to the `data.master` controller. The controller
 * can be a [Raspberry Pi] or [OSE Main board], for example.
 *
 * @class control.lib.switch.socket
 * @extend ose.lib.entry.command
 * @type class
 */

// Public {{{1
function C(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Switch entry
 *
 * @method constructor
 */

  O.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      caption: entry.getCaption(),
      entry: entry.identify(),
      pin: entry.data.pin,
      type: 'din',
      flavour: 'switch',
      debounce: entry.state.debounce,
      tap: entry.state.tap,
      hold: entry.state.hold,
    }
  );
};

exports.synced = function(val) {  // {{{2
  this.entry.setState({synced: val});
};

exports.press = function(data) {  // {{{2
/**
 * Press handler
 *
 * @method press
 */

  console.log('SWITCH PRESSED');

  this.entry.setState({
    value: 1,
    at: data.at,
  });
  this.entry.emit('press', data.at);
};

exports.release = function(data) {  // {{{2
/**
 * Release handler
 *
 * @method release
 */

//  console.log('SWITCH RELEASED');

  this.entry.setState({
    value: 0,
    at: data.at,
  });
  this.entry.emit('release', data.at);
};

exports.tap = function(data) {  // {{{2
/**
 * Tap handler
 *
 * @param count {Object} Tap counts within `state.tap` timeout
 *
 * @method tap
 */

//  console.log('SWITCH TAPPED', count);

  this.entry.emit('tap', data.count, data.at);
};

exports.hold = function(data) {  // {{{2
/**
 * Hold handler
 *
 * @method hold
 */

//  console.log('SWITCH HELD');

  this.entry.emit('hold', data.at);
};

// }}}1
