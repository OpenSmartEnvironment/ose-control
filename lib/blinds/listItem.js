'use strict';

const O = require('ose')(module);

exports.displayLayout = function() {
  this
    .empty()
    .on('tap', this.tapItem.bind(this))
    .section('row')
      .h3(this.entry.getCaption(), 'stretch')
      .span(formatPos(this.entry))
      .style('padding-bottom', '10px')
      .parent()
    .buttons('char', ['stop', 'grid', 'select', 'right', 'left', 'pause'], {
      setup: setupButtons.bind(this),
      input: onInput.bind(this),
    })
  ;
};

exports.patch = function(val) {  // {{{2
  if (! val) return;

  val = val.spatch;

  if (val === null) {
    this.find('span').text();
    return;
  }

  if (! val) return;

  if ('pos' in val) {
    this.find('span').text(formatPos(this.entry));
  }
};

// Private {{{1
function setupButtons(wrap) {  // {{{2
  var that = this;

  wrap
    .addClass('row')
    .addClass('no-child-padding')
    .addClass('center')
  ;

  button('right');
  button('left');

  function button(name) {
    wrap.find('i[data-icon="' + name + '"]')
      .addClass('anticlockwise')
      .params({holdTimeout: 100})
      .on('hold', function() {
        switch (name) {
        case 'right':
          that.post('set', 1);
          return false;
        case 'left':
          that.post('set', 0);
          return false;
        }
        throw O.log.error(wrap, 'Invalid name', name);
      })
      .on('release', function() {
        that.post('stop');
        return false;
      });
    ;
  }
}

function onInput(ev) {  // {{{2
  switch (ev.value) {
  case 'stop':
    this.post('set', 0);
    return false;
  case 'grid':
    this.post('set', 'semi');
    return false;
  case 'select':
    this.post('set', 1);
    return false;
  case 'right':
    this.post('move', 0.01);
    return false;
  case 'left':
    this.post('move', -0.005);
    return false;
  case 'pause':
    this.post('stop');
    return false;
  }

  throw O.log.error(wrap, 'Invalid value', ev);
}

function formatPos(entry) {  // {{{2
  switch (entry.sval.pos) {
  case undefined:
    return 'Unknown';
  case 0:
    return 'Closed';
  case 1:
    return 'Opened';
  default:
    return  Math.trunc(entry.sval.pos * 100) + ' %';
  }
}
