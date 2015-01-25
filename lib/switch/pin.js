'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

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

  M.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      caption: entry.getCaption(),
      entry: entry.identify(),
      index: entry.data.pin,
      type: 'din',
      flavour: 'switch',
      debounce: entry.state.debounce,
      tap: entry.state.tap,
      hold: entry.state.hold,
    }
  );
};

exports.error = function(err) {  // {{{2
  M.log.error(err);

  this.close();
};

exports.close = function(resp) {  // {{{2
  this.sync(false);

  M.log.notice('Switch link to master pin was permanently closed', {entry: this.entry.identify(), resp: resp});
};

exports.sync = function(value) {  // {{{2
/**
 * Sync handler
 *
 * @param value {Boolean}
 *
 * @method sync
 */

  this.entry.setState({synced: value});

  if (this.link) {
    this.link.read();
  }
};

exports.press = function() {  // {{{2
/**
 * Press handler
 *
 * @method press
 */

//  console.log('SWITCH PRESSED');

  this.entry.setState({
    value: 1,
    at: Ose._.now(),
  });
  this.entry.emit('press');
};

exports.release = function() {  // {{{2
/**
 * Release handler
 *
 * @method release
 */

//  console.log('SWITCH RELEASED');

  this.entry.setState({
    value: 0,
    at: Ose._.now(),
  });
  this.entry.emit('release');
};

exports.tap = function(count) {  // {{{2
/**
 * Tap handler
 *
 * @param count {Object} Tap counts within `state.tap` timeout
 *
 * @method tap
 */

//  console.log('SWITCH TAPPED', count);

  this.entry.emit('tap', count);
};

exports.hold = function() {  // {{{2
/**
 * Hold handler
 *
 * @method hold
 */

//  console.log('SWITCH HELD');

  this.entry.emit('hold');
};

// }}}1
