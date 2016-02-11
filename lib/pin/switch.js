'use strict';

const O = require('ose')(module)
  .class('./index')
;

const Consts = O.consts('control');
const Din = O.getClass('./din');

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

  state.raw = 1;
}

function update(val) {  // {{{2
  var that = this;
  var now = Date.now();

  var s = {};
  s[this.index] = {raw: val ? 1 : 0};
  this.pins.entry.setState({pins: s});

  console.log('SWITCH UPDATE', val);

  switch (this.state) {
  case 'pressed':
    if (val) {
      this.state = 'released';
      release(now);
      return;
    }

    release(now - this.debounce / 2);
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

  O.link.error(this, O.error(this, 'Invalid current state', {state: this.state}));
  return;

  function press() {  // {{{3
    O.link.send(that, 'press', {at: now});

    if (that.holdHandle) {
      O.log.unhandled('Hold handle should be cleared on release!');
      clearTimeout(that.holdHandle);
      delete that.holdHandle;
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
O.exports.displayControl = function(wrap, li, key) {
  li.find('section.row').stub('i', 'button char');
};

O.exports.patchControl = function(wrap, li, patch) {
  if ('raw' in patch) {
    console.log('SWITCH PATCH', patch.raw);

    li.find('i.button')
      .attr('data-icon', patch.raw ? 'o' : 'brightness')
      .style('color', patch.raw ? undefined : Consts.green)
    ;
  }
};
