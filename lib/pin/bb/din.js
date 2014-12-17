'use strict';

// Public {{{1
exports.display = function(pagelet, li, key, pin) {  // {{{2
  li.append([
    $('<p>').append([
       $('<span>').text(key),
       $('<span>').text(pin.type ? ' – ' + pin.type : ''),
       $('<span>').text(pin.flavour && (pin.flavour !== 'default')  ? ' \(' + pin.flavour + '\)' : '')
    ]),
    $('<p>').text(pin.entry && pin.entry.entry ? pin.entry.entry : '')
  ]);

  switch(pin.flavour) {
    case 'counter':

      li.prepend([
        $('<aside>'),
        $('<aside>', {'class': 'pack-end'}).append($('<p>', {id: pagelet.id + key + 'count'}).text(pin.value))
      ]);
      break;
    default:
      var checkbox = pagelet.newWidget('checkbox', key + 'Checkbox', {
        value: pin.value,
        disabled: true
      });

      li.prepend([
        $('<aside>'),
        $('<aside>', {'class': 'pack-end'}).append(checkbox)
      ]);
      break;
  }
};

exports.update = function(pagelet, key, pin) {  // {{{2
  switch(pagelet.entry.state.pins[key].flavour) {
    case 'counter':
      pagelet.$(key + 'count').text(pin.value);
      break;
    default:
      pagelet.widget(key + 'Checkbox', {value: pin.value});
      break;
  }
};

// }}}1
