'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light-to-switch client socket
 *
 * @readme
 * Establishes a link to a [switch] controlling behaviour of a light.
 *
 * @class control.lib.light.switch
 * @type class
 */

// Public {{{1
function init(entry, sw) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  O.inherited(this)(entry, sw, 'relay');
};

exports.press = function(req) {  // {{{2
/**
 * Press handler
 *
 * @method press
 * @handler
 */

//  console.log('SWITCH PRESSED', req);
};

exports.release = function(req) {  // {{{2
/**
 * Release handler
 *
 * @method release
 * @handler
 */

//  console.log('SWITCH RELEASED', req);
};

exports.tap = function(count) {  // {{{2
/**
 * Tap handler
 *
 * @param count {Number} Count of presses within `O.consts("control").switchTapTimeout`.
 *
 * @method tap
 * @handler
 */

//  console.log('SWITCH TAPPED', count);

  switch (count) {
  case 1:
    this.entry.command('profile', 'switch');
    break;
  case 2:
    this.entry.command('profile', 'full');
    break;
  default:
    this.entry.command('profile', 'off');
  }

};

exports.hold = function(req) {  // {{{2
/**
 * Hold handler
 *
 * @method hold
 * @handler
 */

//  console.log('SWITCH HELD', req);

  this.entry.command('profile', 'off');
};

// }}}1
