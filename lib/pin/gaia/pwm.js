'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.append('p', {pinIndex: key}).text(pin.raw);
};

exports.update = function(pagelet, key, pin) {
  pagelet.find('li[pinIndex="' + key + '"] p').text()
};
