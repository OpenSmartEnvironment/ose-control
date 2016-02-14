'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'din');

var Pin = O.getClass('./pin');

/** Doc {{{1
 * @submodule control.distributor
 */

/**
 * @caption Digital input pin kind
 *
 * @readme
 * Kind defining digital input entries
 *
 * The `din` entry connects to the controller by creating a [link] to
 * the master controller pin.  The `sval` of the `din` entry then
 * changes with the state of the physical pin on the controller side.
 *
 * @kind din
 * @schema control
 * @class control.lib.din
 * @extend ose.lib.kind
 * @type singleton
 */

/**
 * Identification of entry representing a controller
 *
 * @property dval.master
 * @type String | Object
 */

/**
 * The pin index of the corresponding pin on the controller.
 *
 * @property dval.pin
 * @type String
 */

// Public {{{1
exports.role = ['pin'];

exports.ddef = O.new('ose/lib/field/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('master')  // {{{3
    .detail(11)
    .parent

  .text('pin')  // {{{3
    .detail(12)
    .parent

  .integer('debounce')  // {{{3
    .params({unit: 'ms'})
    .detail(13)
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/field/object')()  // {{{2
  .text('value')  // {{{3
    .detail(1, valueDetail)
    .parent

  .boolean('synced')  // {{{3
    .params({readonly: true})
    .detail(2)
    .parent

  .millitime('at')  // {{{3
    .params({readonly: true})
    .detail(3)
    .parent

  // }}}3

exports.homeInit = function(entry) {  // {{{2
  entry.sval = {
    debounce: entry.dval.debounce,
  };

  new Pin(entry);
};

// Private {{{1
function valueDetail(view, wrap) {  // {{{2
  var li = view.li()
    .section('row')
      .section('stretch')
        .h3('Value', 'stretch')
        .parent()
      .onoff(function(val) {
        view.entry.shard.post(view.entry.dval.master, 'emulatePin', {
          index: view.entry.dval.pin,
          value: val.value,
        });
      })
    .parent()
  ;

  wrap.on('patch', function(patch) {
    li.find('.buttons').val(wrap.value);
  });
}

