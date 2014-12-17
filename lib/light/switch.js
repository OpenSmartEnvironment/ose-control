'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

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
function C(entry, sw) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  M.super.call(this, entry, sw, 'relay');
};

exports.error = function(err) {  // {{{2
/**
 * Error handler
 *
 * @param err {Object} [Error] instance
 *
 * @method error
 */

  M.log.error(err);
  this.close(err.message);
};

exports.press = function(req) {  // {{{2
/**
 * Press handler
 *
 * @method press
 */

//  console.log('SWITCH PRESSED', req);
};

exports.release = function(req) {  // {{{2
/**
 * Release handler
 *
 * @method release
 */

//  console.log('SWITCH RELEASED', req);
};

exports.tap = function(count) {  // {{{2
/**
 * Tap handler
 *
 * @param count {Number} Count of presses within `M.consts.switchTapTimeout`.
 *
 * @method tap
 */

//  console.log('SWITCH TAPPED', count);

  switch (count) {
  case 1:
    this.entry.command('switch');
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
 */

//  console.log('SWITCH HELD', req);

  this.entry.command('profile', 'off');
};

// }}}1
