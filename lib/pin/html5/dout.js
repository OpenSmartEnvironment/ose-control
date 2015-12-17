'use strict';

exports.display = function(view, li, key, state) {
  li.find('section.row').buttons(['brightness', 'o'], {char: true, relation: 'single'}, function(name) {
    if (! view.updating) {
      view.post('writePin',
        {
          index: key,
          value: name === 'brightness',
        }
      );
    }
  });
};

exports.update = function(view, li, key, patch, state) {
  if ('raw' in patch) {
    li.find('.buttons').val(patch.raw ? 'brightness' : 'o');
  }
};
