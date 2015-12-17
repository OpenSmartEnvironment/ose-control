'use strict';

var O = require('ose').module(module);

var Consts = O.consts('control');

exports.display = function(view, li, key, state) {
  li.find('section.row').append('i', 'button char').style('color', Consts.green);
};

exports.update = function(view, li, key, patch, state) {
  if ('raw' in patch) {
    li.find('i.button').text(patch.raw ? 'brightness' : 'o');
  }
};
