'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('control', 'sensor');

var Pin = O.class('./pin/client');

// Public {{{1
exports.schema.map('sensor', {  // {{{2
  kind: 'sensor',
  unique: true,
  onePerEntry: true,
  map: function(entry, cb) {
    cb(entry.dval.alias, entry.id);
  },
  getId: function(key, value) {
    return value;
  },
});

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

