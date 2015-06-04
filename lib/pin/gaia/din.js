'use strict';

exports.display = function(view, li, key, pin) {
  li.append('gaia-checkbox', { disabled: true }).on('click', function(ev) {
    view.stop(ev);
    ev.currentTarget.checked = ! ev.currentTarget.checked;

    var dialog = view.append('gaia-dialog-alert').text('It is not possible to control input pins.');
    dialog.el.open();
  });
};

exports.update = function(view, li, key, pin) {
  li.find('gaia-checkbox').val(pin.raw);
};
