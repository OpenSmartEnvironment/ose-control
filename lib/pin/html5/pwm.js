'use strict';

exports.display = function(view, li, key, state) {
  li.append('p', {pinIndex: key}).text(state.raw);
};

exports.update = function(view, li, key, patch, state) {
  if ('raw' in patch) {
    li.find('p').text(patch.raw);
  }
};
