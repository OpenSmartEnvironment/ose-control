'use strict';

var O = require('ose').class(module).prepend('./index');

/* Doc {{{
 * @submodule control.pin
 */

/*
 * @caption Counter pin flavour
 *
 * @readme
 * Setup of a digital input pin acting as a counter. When a pin
 * changes its value to 1, the counter increments. `link.update()` is
 * sent throttled by a timeout defined in the request or the default
 * timeout of 1 second.
 *
 * This pin flavour can be used, for example, by a gas or liquid flow
 * meter.
 *
 * @class control.lib.pin.counter
 * @type extend
 */

// Public {{{1
/*
module.exports = function(pin, req, state, resp, cb) {
  pin.value = null;

  pin.send = counter;
  if (req && req.throttle) {
    pin.sendCounter = O._.throttle(send, req.throttle);
  } else {
    pin.sendCounter = send;
  }

  cb();
};

function counter(value) {
  if (this.value === null) {
    this.value = 0;
  } else {
    if (value) {
      this.value++;
      send();
    }
  }

  this.sendCounter(data);
};

function send(value) {
  var data = {
    value: this.value,
    at: new Date().getTime()
  };

  this.link.update(data);

  var state = {};
  state[this.index] = data;
  this.master.setState({pins: state});

  this.send(data);
};

*/
