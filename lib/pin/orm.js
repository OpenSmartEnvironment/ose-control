'use strict';

var O = require('ose').class(module, 'ose/lib/orm/field');

// Public {{{1
exports.displayMapDetail = function(wrap, ul, li, key, patch) {  // {{{2
  var pinClass;
  var val = wrap.value[key];

  if (! wrap.pinClasses) {
    wrap.pinClasses = {};
  }

  pinClass = wrap.pinClasses[key];
  if (! pinClass) {
    pinClass = wrap.pinClasses[key] = O.class((val.path || './') + (val.flavour || val.type));
  }

  if (patch === null) {
    delete wrap.pinClasses[key];

    if (! li) return;

    if (pinClass.removeDetail) {
      pinClass.removeDetail(wrap, ul, li, key, patch);
      return;
    }

    li.remove();
    return;
  }

  if (! li) {
    if (pinClass.displayDetail) {
      li = pinClass.displayDetail(wrap, ul, li, key);
    } else {
      var li = ul.li({tabindex: 0, mapkey: key}).on('click', onClick);

      li.section('row').section('stretch')
        .h3(key + ' – ' + val.type + (val.flavour ? ' (' + val.flavour + ')' : ''))
        .p(val.caption || (val.entry && val.entry.id) || '')
      ;

      if (pinClass.displayControl) {
        pinClass.displayControl(wrap, li, key, val);
      }
    }
  }

  if (pinClass.patchControl) {
    pinClass.patchControl(wrap, li, patch, val);
  }

  return;

  function onClick(ev) {  // {{{3
    ul.stop(ev);

    if (! wrap.value[key].entry) {
      O.log.error(wrap.field, 'Missing entry', key);
      return;
    }

    O.ui.display({
      content: {
        view: 'detail',
        ident: wrap.value[key].entry,
        dialog: true,
      }
    });
  }

  // }}}3
};

