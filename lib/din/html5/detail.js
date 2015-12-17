'use strict';

exports.displayLayout = function() {
  var that = this;

  this.li('row')
    .h3('Emulate input', 'stretch')
    .buttons(['brightness', 'o'], {char: true, relation: 'single'}, function(val) {
      that.entry.shard.post(that.entry.dval.master, 'emulatePin', {
        index: that.entry.dval.pin,
        value: val === 'brightness',
      });
    })
  ;

  return;
};

exports.updateState = function(val) {
  var buttons = this.find('.buttons');

  if (! ('value' in val)) return;

  switch (val.value) {
  case 1:
    buttons.val('brightness');
    return;
  case 0:
    buttons.val('o');
    return;
  }

  buttons.val(undefined);
  return;
};


