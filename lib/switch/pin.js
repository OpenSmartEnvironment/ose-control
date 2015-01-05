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

exports.end = function(err, resp) {  // {{{2
/**
 * Broken link handler
 *
 * @param err {Object} [Error] instance
 * @param resp {*} Response
 *
 * @method end
 */

//  console.log('SWITCH LINK END');

  this.entry.setState({synced: false});

  if (err) {
    M.log.error(err);
  } else {
    M.log.notice('Switch link to master pin was permanently closed', resp);
  }
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
