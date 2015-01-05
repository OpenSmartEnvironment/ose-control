'use strict';

exports.display = function(pagelet, li, key, pin) {
  var checkbox = pagelet.newWidget('checkbox', key + 'Checkbox', {
    value: pin.value,
    disabled: true
  });

  li.prepend([
    $('<aside>'),
    $('<aside>', {'class': 'pack-end'}).append(checkbox)
  ]);
};

exports.update = function(pagelet, key, pin) {
  pagelet.widget(key + 'Checkbox', {value: pin.value});
};
