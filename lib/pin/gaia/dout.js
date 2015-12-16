'use strict';

exports.display = function(view, li, key, state) {
  li.find('section.row').buttons(['on', 'off'], {char: true, relation: 'single'}, function(name) {
    if (! view.updating) {
      view.post('writePin',
        {
          index: key,
          value: name === 'on',
        }
      );
    }
  });

  /*
  li.append('gaia-switch', {
    danger: state.confirm // TODO
  }).on('change', onChange);

  function onChange(ev) {
    view.stop(ev);

    if (! view.updating) {
      view.post('writePin',
        {
          index: key,
          value: view.wrap(ev.currentTarget).val() ? 1 : 0
        }
      );
    }
  }
  */
};

exports.update = function(view, li, key, patch, state) {
  if ('raw' in patch) {
    li.find('.buttons').val(patch.raw ? 'on' : 'off');
  }
};
