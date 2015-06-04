'use strict';

exports.display = function(view, li, key, pin) {
  li.append('gaia-switch', {
    danger: pin.confirm // TODO
  }).on('change', onChange);

  function onChange(ev) {
    view.stop(ev);

    if (! view.updatingState) {
      view.post('writePin',
        {
          index: key,
          value: view.wrap(ev.currentTarget).val() ? 1 : 0
        }
      );
    }
  }
};

exports.update = function(view, li, key, change, full) {
  li.find('gaia-switch').val(full.raw);
};
