'use strict';

var O = require('ose').module(module);

var Dout = require('./dout');
var Pwm = require('./pwm');

exports.display = function(view, li, key, state) {
  switch (state.type) {
  case 'dout':
    Dout.display(view, li, key, state);
    return;
  case 'pwm':
    Pwm.display(view, li, key, state);
    return;
  }

  throw O.log.error(view, 'INVALID_ARGS', state.type);
};

exports.update = function(view, li, key, patch, state) {
  switch (state.type) {
  case 'dout':
    Dout.update(view, li, key, patch, state);
    return;
  case 'pwm':
    Pwm.update(view, li, key, patch, state);
    return;
  }

  throw O.log.error(view, 'INVALID_ARGS', state.type);
};
