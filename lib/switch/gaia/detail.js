'use strict';

// Public {{{1
exports.dprofile = {  // {{{2
  name: 1,
  master: 2,
  pin: 3,
  debounce: 4,
  tap: 5,
  hold: 6,
};

exports.displayLayout = function() {  // {{{2
  if (this.entry.embryo) return;

  this.append('li').append('div')
    .add('<h3>Emulate switch</h3>')
    .append('gaia-button', {
      circular: 'circular',
//      'data-icon': 'focus-locking',
    })
      .on('mousedown', onDown.bind(this))
      .on('mouseup', onUp.bind(this))
      .append('a', {'data-icon': 'focus-locking'})
  ;

  return;
};

// }}}1
// Private {{{1
function onDown(ev) {  // {{{2
  this.stop(ev);
  
  this.entry.postTo(this.entry.data.master, 'emulatePin', {
    index: this.entry.data.pin,
    value: 0
  });
};

function onUp(ev) {  // {{{2
  this.stop(ev);
  
  this.entry.postTo(this.entry.data.master, 'emulatePin', {
    index: this.entry.data.pin,
    value: 1
  });
};

// }}}1
