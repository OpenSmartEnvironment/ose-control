'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

/** Doc {{{1
 * @caption Power distributors
 *
 * @readme

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
 * [Entry kind] defining power behaviour of distributors.
 *
 * @class control.lib.distributor
 * @extend ose.lib.kind
 * @type class
 */

