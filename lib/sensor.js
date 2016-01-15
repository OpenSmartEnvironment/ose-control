'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('control', 'sensor');

var Pin = O.class('./pin/client');

// Public {{{1
exports.ddef = O.new('ose/lib/orm/object')()  // {{{2
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

exports.sdef = O.new('ose/lib/orm/object')()  // {{{2
  .integer('value')  // {{{3
    .detail(1)
    .parent

  .millitime('at')  // {{{3
    .detail(2)
    .parent

  // }}}3
;

exports.homeInit = function(entry) {  // {{{2
  new Pin(entry, 'ain');
};

exports.layout('listItem', {  // {{{2
  displayLayout: function() {
    this.addClass('row')
      .span('value' in this.entry.sval ? this.entry.sval.value : '')
      .find('h3').addClass('stretch')
    ;
  },
  patch: function(val) {
    val = val && val.spatch;

    if (! val || val.value === null) {
      this.find('span').text();
      return;
    }

    if ('value' in val) {
      this.find('span').text(val.value);
    }
  },
});
/* OBSOLETE {{{1
exports.schema.map('sensor', {  // {{{2
  kind: 'sensor',
  unique: true,
  onePerEntry: true,
  map: function(entry, cb) {
    cb([entry.dval.name || entry.dval.alias, entry.id]);
  },
  getId: function(key, value) {
    return key[1];
  },
});

}}}1 */
