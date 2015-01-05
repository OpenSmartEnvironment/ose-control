'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.prepend([
    $('<aside>'),
    $('<aside>', {'class': 'pack-end'}).append($('<p>', {id: pagelet.id + key + 'pwm'}).text(pin.value))
  ]);
};

exports.update = function(pagelet, key, pin) {
  pagelet.$(key + 'pwm').text(pin.value);
};
