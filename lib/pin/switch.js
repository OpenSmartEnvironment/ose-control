'use strict';

var O = require('ose').class(module);
var Pin = require('./index');
O.prepend(Pin);

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
exports.setup = function(state, cb) {  // {{{2
  var that = this;

  this.update = O._.debounce(update.bind(this), this.req.debounce);

  Pin.setup.call(this, state, function(err, val) {
    if (err) {
      cb(err);
      return;
    }

    if (that.pins.dummy) {
      val.value = 1;
    }
    that.state = val.value ? 'released' : 'pressed';

    cb(err, val);
    return;
  });
};

function update(val) {  // {{{2
  var s = {};
  s[this.index] = {raw: val};
  this.pins.entry.setState({pins: s});

  var that = this;
  var now = O._.now();

  switch (this.state) {
  case 'pressed':
    if (val) {
      this.state = 'released';
      release(now);
      return;
    }

    release(now - this.req.debounce / 2);
    press();
    return;
  case 'released':
    if (val) {
      press();
      release(now);
      return;
    }

    this.state = 'pressed';
    press();
    return;
  }

  O.link.error(this, O.error(this, 'unknownCurrentState', {state: this.state}));
  return;

  function press() {  // {{{3
    O.link.send(that, 'press', {at: now});

    if (that.holdHandle) {
      O.log.unhandled('Hold handle should be cleared on release!');
      clearTimeout(that.holdHandle);
    }

    that.holdHandle = setTimeout(onTime, that.req.hold);
  };

  function release(at) {  // {{{3
    if (that.holdHandle) {
      clearTimeout(that.holdHandle);
      delete that.holdHandle;

      if ((at - that.lastTap) < that.req.tap) {
        ++that.tapCount;
      } else {
        that.tapCount = 1;
      }

      O.link.send(that, 'tap', {at: now, count: that.tapCount});
      that.lastTap = at;
    } else {
      that.lastTap = 0;
    }

    O.link.send(that, 'release', {at: now});
  };

  function onTime() {  // {{{3
    delete that.holdHandle;

    O.link.send(that, 'hold', {at: now});
  };

  // }}}3
};

// }}}1
