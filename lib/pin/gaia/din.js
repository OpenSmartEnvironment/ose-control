'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.append('gaia-checkbox', { disabled: true });  // TODO "disabled" is not working
};

exports.update = function(pagelet, key, pin) {
  pagelet.find('li[pinIndex="' + key + '"] gaia-checkbox').val(pin.raw);
};
