'use strict';

var Ose = require('ose');
var M = Ose.module(module);

// Public {{{1
exports.updatePins = function(pagelet, pins) {  // {{{2
  for (var key in pins) {
    var pin = pins[key];

    if (pagelet.$(key).length) {
      pagelet.pinTypeUpdates[key](pagelet, key, pin);
    } else {
      newPin(pagelet, key, pin);
    }
  };

/*
  if (state.lastConflict) {  // TODO Display conflicts.
    console.log('Last conflict: ', state.lastConflict);
  }
*/

};

// }}}1
// Private {{{1
function newPin(pagelet, key, pin) {  // {{{2
  var li = $('<li>', {
    id: pagelet.id + key,
  })
    .appendTo(pagelet.$(' > ul'))
    .click(onClick)
  ;

  if (pin.type) {
    if (! pagelet.pinTypeUpdates) pagelet.pinTypeUpdates = {};

    var unit = require(pagelet.entry.state.pinTypes[pin.type].path + '/bb/' + pin.type);
    if (unit) {
      unit.display(pagelet, li, key, pin);
      pagelet.pinTypeUpdates[key] = unit.update;
    }
  }

  function onClick(ev) {
    if (pin.entry) {
      Ose.ui.display({
        content: {
          pagelet: 'detail',
          entry: pin.entry.entry,
          space: pin.entry.space,
          shard: pin.entry.shard,
          dialog: true
        }
      });
    } else {
      M.log.unhandled('Missing pin.entry.');
    }

    return false;
  }

};

// }}}1
