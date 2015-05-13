'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.append('gaia-checkbox', { disabled: true }).on('click', function(ev) {
    pagelet.stop(ev);
    ev.currentTarget.checked = ! ev.currentTarget.checked;

    var dialog = pagelet.append('gaia-dialog-alert').text('It is not possible to control input pins.');
    dialog.el.open();
  });
};

exports.update = function(pagelet, li, key, pin) {
  li.find('gaia-checkbox').val(pin.raw);
};
