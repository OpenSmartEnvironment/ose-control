'use strict';

exports.display = function(view, li, key, pin) {
  li.append('p', {pinIndex: key}).text(pin.raw);
};

exports.update = function(view, li, key, pin) {
  li.find('p').text(pin.raw);
};
