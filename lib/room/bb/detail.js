'use strict';

var Ose = require('ose');
var M = require('ose').module(module);

var DefaultText = 'Choose your activity';

// Public {{{1
exports.displayData = function() {  // {{{2
  this.displayCaption(this.$('header'));

  var children = this.newPagelet({
    pagelet: 'list',
    scope: 'control',
    filter: {
      parent: this.entry.id
    }
  });

  this.$()
    .empty()
    .append(this.newWidget('list', 'list'))
    .append(children.html())
  ;

  children.loadData();

  this.$('list > ul')
    .append($('<li>', {'class': 'activity'})
      .on('click', onClickActivity.bind(this))
      .append($('<p>', {'class': 'name'}).text(DefaultText))
      .append($('<p>', {'class': 'value'}))
    )
  ;

  if (! this.entry.data.activities) {
    this.$('list').hide();
  }
};

exports.updateState = function(state) {  // {{{2
  for (var key in state) {
    switch (key) {
      case 'activity':
        this.$('list > ul > li.activity > p.value').text(state.activity);

        break;
      default:
        M.log.notice('UNKNOWN ROOM STATE: ', state);
    }
  }
};

// }}}1
// Event Handlers {{{1
function onClickActivity(ev) {  // {{{2
  var that = this;
  var options = {};

  Ose._.each(this.entry.data.activities, function(el, i, list) {
    options[i] = {
      text: i
    }
  });

  Ose.ui.newDialog('valueSelector', {
    caption: DefaultText,
    options: options,
    value: this.entry.state.activity,
    auto: true,
    cb: onSelectActivity
  });

  return false;

  function onSelectActivity(activity) {  // {{{3
    if (activity || activity === null) {
      that.action('activity', activity)
    }

    return true;
  };

  // }}}3
};

// }}}1
