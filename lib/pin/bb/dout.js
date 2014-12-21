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

  var checkbox = pagelet.newWidget('checkbox', key + 'Checkbox', {
    value: pin.value,
    change: onChange,
    danger: pin.confirm
  });

  li.prepend(
    $('<aside>'),
    $('<aside>', {'class': 'pack-end'}).append(checkbox)
  );

  function onChange(ev, params) {
    pagelet.post('updatePin',
      {
        index: key,
        value: pagelet.widget(key + 'Checkbox') ? 1 : 0,
      }
    );

    return false;
  }
};

exports.update = function(pagelet, key, pin) {  // {{{2
  pagelet.widget(key + 'Checkbox', {value: pin.value});
};

// }}}1
