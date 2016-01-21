'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Switch-to-controller client socket
 *
 * @readme
 * Establishes a link to the `dval.master` controller. The controller
 * can be a [Raspberry Pi], for example.
 *
 * @class control.lib.switch.socket
 * @extend ose.lib.entry.command
 * @type class
 */

// Public {{{1
function init(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Switch entry
 *
 * @method constructor
 */

  O.inherited(this)(
    entry,
    entry.dval.master,
    'registerPin',
    {
      index: entry.dval.pin,
      type: 'din',
      flavour: 'switch',
      debounce: entry.sval.debounce,
      tap: entry.sval.tap,
      hold: entry.sval.hold,
    }
  );
};

exports.synced = function(val, data) {  // {{{2
  if (val) {
    this.entry.setState({
      synced: true,
      value: data.value,
      at: data.at,
    });
  } else {
    this.entry.setState({synced: false});
  }
};

exports.press = function(val) {  // {{{2
/**
 * Press handler
 *
 * @method press
 */

//  console.log('SWITCH PRESSED', val);

  this.entry.setState({
    value: 'pressed',
    at: val.at,
  });
  this.entry.emit('press', val.at);
};

exports.release = function(val) {  // {{{2
/**
 * Release handler
 *
 * @method release
 */

//  console.log('SWITCH RELEASED', val);

  this.entry.setState({
    value: 'released',
    at: val.at,
  });
  this.entry.emit('release', val.at);
};

exports.tap = function(val) {  // {{{2
/**
 * Tap handler
 *
 * @param count {Object} Tap counts within `sval.tap` timeout
 *
 * @method tap
 */

//  console.log('SWITCH TAPPED', val);

  this.entry.emit('tap', val.count, val.at);
};

exports.hold = function(val) {  // {{{2
/**
 * Hold handler
 *
 * @method hold
 */

//  console.log('SWITCH HELD');

  this.entry.emit('hold', val.at);
};

// }}}1
