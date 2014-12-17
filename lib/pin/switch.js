'use strict';

var Ose = require('ose');
var M = Ose.module(module);

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Switch pin flavour
 *
 * @readme

 * Processes pin changes and calls `link.press()`, `link.release()`,
 * `link.tap(count)` or `link.hold()` instead of `link.update()`.
 *
 * @class control.lib.pin.switch
 * @type extend
 */

// Public {{{1
module.exports = function(pin, req, state, resp) {
  pin.debounce = req.debounce;
  pin.holdTimeout = req.hold;
  pin.tapTimeout = req.tap;

  pin.send = Ose._.debounce(send.bind(pin), req.debounce);
  pin.read = read;
};

// Private {{{1
function read(req, socket) {  // {{{2
  Ose.link.close(socket, this.state);
};

function send(value) {  // {{{2
//  console.log('SWITCH CHANGE', value);

  var that = this;
  var now = Ose._.now();

  switch (this.state) {
  case undefined:  // First state update.
    this.state = value ? 'released' : 'pressed';
    return;
  case 'pressed':
    if (value) {
      this.state = 'released';
      release(now);
    } else {
      release(now - this.debounce / 2);
      press();
    }
    return;
  case 'released':
    if (value) {
      press();
      release(now);
    } else {
      this.state = 'pressed';
      press();
    }
    return;
  }

  Ose.link.error(this, Ose.error(this, 'unknownCurrentState', {state: this.state}));
  return;

  function press() {  // {{{3
    that.link.press();

    if (that.holdHandle) {
      M.log.unhandled('Hold handle should be cleared on release!');
      clearTimeout(that.holdHandle);
    }

    that.holdHandle = setTimeout(onTime, that.holdTimeout);
  };

  function release(at) {  // {{{3
    if (that.holdHandle) {
      clearTimeout(that.holdHandle);
      delete that.holdHandle;

      if ((at - that.lastTap) < that.tapTimeout) {
        ++that.tapCount;
      } else {
        that.tapCount = 1;
      }

      that.link.tap(that.tapCount);
      that.lastTap = at;
    } else {
      that.lastTap = 0;
    }

    that.link.release();
  };

  function onTime() {  // {{{3
    delete that.holdHandle;

    that.link.hold({
      start: now
    });
  };

  // }}}3
};

// }}}1
