'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.updatePins = function(pagelet, pins, full) {  // {{{2
  for (var key in pins) {
    var pin = pins[key];

    var li = pagelet.find('li[pinIndex="' + key + '"]');

    if (li) {
      pagelet.pinTypeUpdates[key](pagelet, key, pin, full[key]);
    } else {
      newPin(pagelet, key, full[key]);
    }
  };
};

// }}}1
// Private {{{1
function newPin(pagelet, key, pin) {  // {{{2
/*
  var li = $('<li>', {id: pagelet.id + key})
    .appendTo(pagelet.$())
    .click(onClick)
  ;
*/

  var li = pagelet.append('li', {pinIndex: key}).on('click', onClick);

  if (! pin.type) return;

  if (! pagelet.pinTypeUpdates) {
    pagelet.pinTypeUpdates = {};
  }

  var path, name;
  if (pin.path) {
    path = pin.path.split('/');
    name = path.pop();
  } else {
    path = 'ose-control/lib/pin'.split('/');
    name = pin.flavour || pin.type;
  }

  li.append('div').add([
    pagelet.new('h3').add([
      pagelet.new('span').text(key + ' – ' + pin.type),
      pagelet.new('span').text(pin.flavour ? ' (' + pin.flavour + ')' : '')
    ]),
    pagelet.new('p').text(pin.caption || (pin.entry && pin.entry.id) || '')
  ]);

  try {
    var unit = require(path.join('/') + '/gaia/' + name);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      O.log.error(err);
    }
    return;
  }

  unit.display(pagelet, li, key, pin);
  pagelet.pinTypeUpdates[key] = unit.update;
  unit.update(pagelet, key, pin, pin);
  return;

  function onClick(ev) {  // {{{3
    pagelet.stop(ev);

    if (! pin.entry) {
      O.log.error(O.error(pin, 'MISSING_ENTRY'));
      return false;
    }

    O.ui.display({
      content: {
        pagelet: 'detail',
        ident: pin.entry,
        dialog: true,
      }
    });
    //return false;
  }

  // }}}3
};

// }}}1
