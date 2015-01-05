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
};

// }}}1
// Private {{{1
function newPin(pagelet, key, pin) {  // {{{2
  var li = $('<li>', {id: pagelet.id + key})
    .appendTo(pagelet.$(' > ul'))
    .click(onClick)
  ;

  if (! pin.type) return;

  if (! pagelet.pinTypeUpdates) {
    pagelet.pinTypeUpdates = {};
  }

  var path = pagelet.entry.state.pins[key].path.split('/');
  var name = path.pop();

  li.append([
    $('<p>').append([
       $('<span>').text(key),
       $('<span>').text(pin.type ? ' – ' + pin.type : ''),
       $('<span>').text(pin.flavour && (pin.flavour !== 'default')  ? ' \(' + pin.flavour + '\)' : '')
    ]),
    $('<p>').text(pin.caption || (pin.entry && pin.entry.entry) || ''),
  ]);

  try {
    var unit = require(path.join('/') + '/bb/' + name);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      M.log.error(err);
    }
  }

  if (! unit) return;

  unit.display(pagelet, li, key, pin);
  pagelet.pinTypeUpdates[key] = unit.update;
  return;

  function onClick(ev) {  // {{{3
    if (! pin.entry) {
      M.log.error(Ose.error(pin, 'MISSING_ENTRY'));
      return false;
    }

    Ose.ui.display({
      content: {
        pagelet: 'detail',
        entry: pin.entry.entry,
        space: pin.entry.space,
        shard: pin.entry.shard,
        dialog: true
      }
    });
    return false;
  }

  // }}}3
};

// }}}1
