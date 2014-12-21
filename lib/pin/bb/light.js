'use strict';

var Dout = require('./dout');
var Pwm = require('./pwm');

exports.display = function(pagelet, li, key, pin) {
  switch (pagelet.entry.state.pins[key].type) {
  case 'dout':
    Dout.display(pagelet, li, key, pin);
    return;
  case 'pwm':
    Dout.display(pagelet, li, key, pin);
    return;
  }

  throw Ose.error(pin, 'INVALID_ARGS');
};

exports.update = function(pagelet, key, pin) {
  switch (pagelet.entry.state.pins[key].type) {
  case 'dout':
    Dout.update(pagelet, key, pin);
    return;
  case 'pwm':
    Dout.update(pagelet, key, pin);
    return;
  }

  throw Ose.error(pin, 'INVALID_ARGS');
};

