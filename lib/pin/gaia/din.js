'use strict';

exports.display = function(view, li, key, state) {
  li.find('section.row').append('a', 'button char');

  /*
  li.append('gaia-checkbox', { disabled: true }).on('click', function(ev) {
    view.stop(ev);
    ev.currentTarget.checked = ! ev.currentTarget.checked;

    var dialog = view.append('gaia-dialog-alert').text('It is not possible to control input pins.');
    dialog.el.open();
  });
  */
};

exports.update = function(view, li, key, patch, state) {
  if ('raw' in patch) {
    li.find('a.button').text(patch.raw);
  }
};
