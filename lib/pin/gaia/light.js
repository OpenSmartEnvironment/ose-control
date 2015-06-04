'use strict';

var O = require('ose').module(module);

var Dout = require('./dout');
var Pwm = require('./pwm');

exports.display = function(view, li, key, pin) {
  switch (view.entry.state.pins[key].type) {
  case 'dout':
    Dout.display(view, li, key, pin);
    return;
  case 'pwm':
    Pwm.display(view, li, key, pin);
    return;
  }

  throw O.error(pin, 'Invalid arguments');
};

exports.update = function(view, li, key, change, full) {
  switch (view.entry.state.pins[key].type) {
  case 'dout':
    Dout.update(view, li, key, change, full);
    return;
  case 'pwm':
    Pwm.update(view, li, key, change, full);
    return;
  }

  throw O.error(change, 'Invalid arguments');
};
