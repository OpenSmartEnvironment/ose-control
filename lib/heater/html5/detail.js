'use strict';

// Public {{{1
exports.profile = {  // {{{2
  parent: 1
  /*
  name: {
    place: 'caption',
    required: true
  }
  */
};

exports.displayLayout = function() {  // {{{2
  this.li('power')
    .section('row')
      .h3('Power', 'stretch')
      .span()
    .parent()
    .slider({}, onPowerSliderInput.bind(this))
  ;

  this.li('state')
    .section('row')
      .h3('Current state', 'stretch')
      .span()
  ;

  this.li('enabled')
    .section('row')
      .h3('Enabled', 'stretch')
      .span()
  ;
};

exports.updateStateKey = function(key, val) {  // {{{2
  switch (key) {
  case 'power':
    this.find('li.power > section.row > span').text(Math.trunc(val * 100).toString() + ' %');
    this.find('li.power > span.slider').val(val);
    break;
  case 'enabled':
    this.find('li.enabled > section.row > span').text(val ? 'Yes' : 'No');
    break;
  case 'value':
    this.find('li.state > section.row > span').text(val ? 'On' : 'Off');
    break;
  }
};

// }}}1
// Private {{{1
function onPowerSliderInput(val) {  // {{{2
  if (! this.updating) {
    this.post('power', val);
  }
};

// }}}1
