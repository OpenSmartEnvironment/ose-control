'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

/** Doc {{{1
 * @submodule control.remote
 */

/**
 * @caption Remote controller command group class for lights
 *
 * @readme
 * Facilitates configuration of controlling lights with remote
 * controllers.
 *
 * @class control.lib.light.remote
 * @type class
 */

// Public {{{1
function C() {  // {{{2
/**
 * Class constructor
 *
 * @method constructor
 */

  this.timeout = 10000;

  this.targets = {};

  this.actions = {
    volumeup: deltaUp,
    volumedown: deltaDown,
  };
};

exports.add = function(index, target) {  // {{{2
/**
 * Call to add a light to this group of commands.
 *
 * @param index {Number} Index of light
 * @param target {Number | String | Object} Light entry identification
 *
 * @method constructor
 */

  this.targets[index] = target;
};

exports.selected = function() {  // {{{2
  delete this.light;
};

exports.number = function(entry, data) {  // {{{2
//  console.log('LIGHTS NUMBER', data, this.light);

  if (this.light) {
    entry.postTo(this.light, 'update', data.number / 9);
  } else {
    this.light = this.targets[data.number];
    if (this.light) {
      entry.postTo(this.light, 'switch', {name: 'switch', speed: 20000});
    }
  }
};

// }}}1
// Private {{{1
function deltaUp(entry, data) {  // {{{2
  delta(entry, 0.02);
};

function deltaDown(entry, data) {  // {{{2
  delta(entry, -0.02);
};

function delta(entry, delta) {  // {{{2
  var that = entry.group;

  if (that.light) {
    entry.postTo(that.light, 'delta', {speed: 10000, value: delta});
  }
};

// }}}1
