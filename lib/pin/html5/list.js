'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.updatePins = function(view, pins, full) {  // {{{2
  for (var key in pins) {
    var pin = pins[key];

    var li = view.find('li[pinIndex="' + key + '"]');

    if (li) {
      if (pin) {
        view.pinTypeUpdates[key](view, li, key, pin, full[key]);
        continue;
      }

      li.remove();
      delete view.pinTypeUpdates[key];
      continue;
    }

    if (pin) {
      newPin(view, key, full[key]);
    }
  };
};

// }}}1
// Private {{{1
function newPin(view, key, pin) {  // {{{2
  var li = view.li({tabindex: 0, pinIndex: key}).on('click', onClick);

  if (! pin.type) return;

  if (! view.pinTypeUpdates) {
    view.pinTypeUpdates = {};
  }

  var path, name;
  if (pin.path) {
    path = pin.path.split('/');
    name = path.pop();
  } else {
    path = 'ose-control/lib/pin'.split('/');
    name = pin.flavour || pin.type;
  }

  li.section('row').section('stretch')
    .h3(key + ' – ' + pin.type + (pin.flavour ? ' (' + pin.flavour + ')' : ''))
    .p(pin.caption || (pin.entry && pin.entry.id) || '')
  ;

  try {
    var unit = require(path.join('/') + '/html5/' + name);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      O.log.error(err);
    }
    return;
  }

  unit.display(view, li, key, pin);
  view.pinTypeUpdates[key] = unit.update;
  unit.update(view, li, key, pin, pin);
  return;

  function onClick(ev) {  // {{{3
    view.stop(ev);

    if (! pin.entry) {
      O.log.error(pin, 'Missing entry');
      return false;
    }

    O.ui.display({
      content: {
        view: 'detail',
        ident: pin.entry,
        dialog: true,
      }
    });
    //return false;
  }

  // }}}3
};

// }}}1
