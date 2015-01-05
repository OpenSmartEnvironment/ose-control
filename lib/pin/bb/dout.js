'use strict';

exports.display = function(pagelet, li, key, pin) {
  var checkbox = pagelet.newWidget('checkbox', key + 'Checkbox', {
    value: pin.value,
    change: onChange,
    danger: pin.confirm,
  });

  li.prepend(
    $('<aside>'),
    $('<aside>', {'class': 'pack-end'}).append(checkbox)
  );

  function onChange(ev) {
    pagelet.post('updatePin',
      {
        index: key,
        value: pagelet.widget(key + 'Checkbox') ? 1 : 0,
      }
    );

    return false;
  }
};

exports.update = function(pagelet, key, pin) {
  pagelet.widget(key + 'Checkbox', {value: pin.value});
};
