'use strict';

var O = require('ose').class(module, './index');

var Din = O.class('./din');

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Switch pin flavour response socket
 *
 * @readme
 * Processes pin changes and calls `link.press()`, `link.release()`,
 * `link.tap(count)` or `link.hold()` instead of `link.update()`.
 *
 * @class control.lib.pin.switch
 * @type extend
 */

// Public {{{1
exports.setup = function(req, resp, state, cb) {  // {{{2
//  console.log('PIN SWITCH SETUP', this.index);

  var that = this;

  this.tap = req.tap;
  this.hold = req.hold;
  this.debounce = req.debounce;

  this.update = O._.debounce(update.bind(this), this.debounce);

  O.inherited(this, 'setup')(req, resp, state, function(err) {
    if (err) return cb(err);

    that.at = resp.at = Date.now();
    that.state = resp.value = state.raw ? 'released' : 'pressed';

//    console.log('PIN SWITCH SETUP RESPONSE', that.index, resp);

    return cb();
  });
};

exports.setupDummy = function(req, resp, state) {  // {{{2
//  console.log('SWITCH PIN SETUP DUMMY', req, resp, state);

  this.tap = req.tap;
  this.hold = req.hold;
  this.debounce = req.debounce;

  this.update = O._.debounce(update.bind(this), this.debounce);

  this.at = resp.at = Date.now();
  this.state = resp.value = 'released';

  state.raw = 0;
}

function update(val) {  // {{{2
  console.log('SWITCH PIN UPDATE', val);

  var s = {};
  s[this.index] = {raw: val};
  this.pins.entry.setState({pins: s});

  var that = this;
  var now = Date.now();

  switch (this.state) {
  case 'pressed':
    if (val) {
      release(now - this.debounce / 2);
      press();
      return;
    }

    this.state = 'released';
    release(now);
    return;
  case 'released':
    if (val) {
      this.state = 'pressed';
      press();
      return;
    }

    press();
    release(now);
    return;
  }

  O.link.error(this, O.error(this, 'Invalid current state', {state: this.state}));
  return;

  function press() {  // {{{3
    O.link.send(that, 'press', {at: now});

    if (that.holdHandle) {
      O.log.unhandled('Hold handle should be cleared on release!');
      clearTimeout(that.holdHandle);
    }

    that.holdHandle = setTimeout(onTime, that.hold);
  };

  function release(at) {  // {{{3
    O.link.send(that, 'release', {at: now});

    if (that.holdHandle) {
      clearTimeout(that.holdHandle);
      delete that.holdHandle;

      if ((at - that.lastTap) < that.tap) {
        ++that.tapCount;
      } else {
        that.tapCount = 1;
      }

      O.link.send(that, 'tap', {at: now, count: that.tapCount});
      that.lastTap = at;
    } else {
      that.lastTap = 0;
    }
  };

  function onTime() {  // {{{3
    delete that.holdHandle;

    O.link.send(that, 'hold', {at: now});
  };

  // }}}3
};

// Class {{{1
O.ctor.displayControl = Din.displayControl;
O.ctor.patchControl = Din.patchControl;

