'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;
exports = O.init('control', 'sensor');

var Pin = O.getClass('./pin/client');

// Public {{{1
exports.role = ['pin', 'sensor'];

exports.ddef = O.new('ose/lib/field/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('parent')  // {{{3
    .detail(11)
    .parent

  .entry('master')  // {{{3
    .detail(12)
    .parent

  .text('pin')  // {{{3
    .detail(13)
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/field/object')()  // {{{2
  .object('pin')  // {{{3
    .integer('value')
      .detail(1)
      .parent

    .millitime('at')
      .detail(2)
      .parent

    .parent

  // }}}3
;

exports.homeInit = function(entry) {  // {{{2
  new Pin(entry, 'ain');
};

exports.layout('listItem', {  // {{{2
  displayLayout: function() {
    this
      .empty()
      .addClass('row')
      .on('tap', this.tapItem.bind(this))
      .h3(this.entry.getCaption(), 'stretch')
      .span('value' in this.entry.sval ? this.entry.sval.value : '')
    ;
  },
  patch: function(val) {
    if (! val) return;
    val = val.spatch;

    if (val === null || val && val.value === null) {
      this.find('span').text();
      return;
    }

    if ('value' in val) {
      this.find('span').text(val.value);
    }
  },
});
