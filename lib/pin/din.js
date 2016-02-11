'use strict';

const O = require('ose')(module)
  .class('./index')
;

const Consts = O.consts('control');

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Digital input pin response socket
 *
 * @readme
 * Setup of digital input pin.
 *
 * @class control.lib.pin.din
 * @type extend
 */

// Public {{{1
exports.update = function(val) {
/**
 * Called on change of physical pin state
 *
 * @param val {Number} New value
 *
 * @method update
 * @internal
 */

  val = val ? 1 : 0;

  var s = {};
  s[this.index] = {
    at: Date.now(),
    raw: val,
  };
  this.pins.entry.setState({pins: s});

  if (! O.link.canSend(this)) return;

  O.link.send(this, 'update', {
    value: val,
    at: s[this.index].at,
  });
  return;
};

// Class {{{1
O.exports.displayControl = function(wrap, li, key) {
  li.find('section.row').stub('i', 'button char');
};

O.exports.patchControl = function(wrap, li, patch) {
  if ('raw' in patch) {
    li.find('i.button')
      .attr('data-icon', patch.raw ? 'brightness' : 'o')
      .style('color', patch.raw ? Consts.green : undefined)
    ;
  }
};

