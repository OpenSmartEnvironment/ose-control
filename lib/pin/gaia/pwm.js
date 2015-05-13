'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.append('p', {pinIndex: key}).text(pin.raw);
};

exports.update = function(pagelet, li, key, pin) {
  li.find('p').text(pin.raw);
};
