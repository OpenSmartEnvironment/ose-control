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

  li.prepend([
    $('<aside>'),
    $('<aside>', {'class': 'pack-end'}).append($('<p>', {id: pagelet.id + key + 'pwm'}).text(pin.value))
  ]);
};

exports.update = function(pagelet, key, pin) {  // {{{2
  pagelet.$(key + 'pwm').text(pin.value);
};

// }}}1
