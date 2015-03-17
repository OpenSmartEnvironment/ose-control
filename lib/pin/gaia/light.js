'use strict';

var O = require('ose').module(module);

var Dout = require('./dout');
var Pwm = require('./pwm');

exports.display = function(pagelet, li, key, pin) {
  switch (pagelet.entry.state.pins[key].type) {
  case 'dout':
    Dout.display(pagelet, li, key, pin);
    return;
  case 'pwm':
    Pwm.display(pagelet, li, key, pin);
    return;
  }

  throw O.error(pin, 'Invalid arguments');
};

exports.update = function(pagelet, key, change, full) {
  switch (pagelet.entry.state.pins[key].type) {
  case 'dout':
    Dout.update(pagelet, key, change, full);
    return;
  case 'pwm':
    Pwm.update(pagelet, key, change, full);
    return;
  }

  throw O.error(change, 'Invalid arguments');
};
