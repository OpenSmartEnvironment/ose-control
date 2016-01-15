'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('control', 'distributor');

/** Doc {{{1
 * @caption Power distributors
 *
 * @readme
 *
 * TBD
 *
 * This component defines basic power distributor entry kinds. By
 * configuring entries of these kinds, it is possible to define the
 * power distributor configuration and behaviour.
 *
 * @module control
 * @submodule control.distributor
 * @main control.distributor
 * @aliases powerDistributor
 */

/**
 * @caption Power distributor kind
 *
 * @readme
 *
 * TBD
 *
 * [Entry kind] defining behaviour of power distributors.
 *
 * @kind distributor
 * @class control.lib.distributor
 * @extend ose.lib.kind
 * @type class
 */

// Public {{{1
exports.role = ['area'];

exports.layout('detail', function() {
  var list = this.view2({
    view: 'list',
    ident: {
      schema: 'control',
      space: this.entry.shard.space.name
    },
    filter: {
      parent: this.entry.id,
    }
  });

  this.add(list);

  list.loadData();
});
