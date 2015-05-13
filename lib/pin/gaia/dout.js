'use strict';

exports.display = function(pagelet, li, key, pin) {
  li.append('gaia-switch', {
    danger: pin.confirm // TODO
  }).on('change', onChange);

  function onChange(ev) {
    pagelet.stop(ev);

    if (! pagelet.updatingState) {
      pagelet.post('writePin',
        {
          index: key,
          value: pagelet.wrap(ev.currentTarget).val() ? 1 : 0
        }
      );
    }
  }
};

exports.update = function(pagelet, li, key, change, full) {
  li.find('gaia-switch').val(full.raw);
};
