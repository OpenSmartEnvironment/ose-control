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
  var that = this;

  this.li('row')
    .h3('Emulate switch', 'stretch')
    .buttons(['brightness', 'o'], {char: true, relation: 'single'}, function(val) {
      that.entry.shard.post(that.entry.dval.master, 'emulatePin', {
        index: that.entry.dval.pin,
        value: val === 'brightness',
      });
    })
  ;

  return;
};

exports.updateState = function(val) {  // {{{2
  var buttons = this.find('.buttons');

  if ('value' in val) switch (val.value) {
  case 'pressed':
    buttons.val('brightness');
    break;
  case 'released':
    buttons.val('o');
    break;
  default:
    buttons.val(undefined);
    break;
  }
};

