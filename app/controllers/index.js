import Ember from 'ember';
import { compileSpec } from 'htmlbars-compiler/compiler';

export default Ember.Controller.extend({
  daTemplate: null,
  daContext: null,
  handlebarsJsonContext: null,
  htmlbarsJsonContext: null,

  jsonParseError: true,

  time: {
    render: {
      handlebars: {
        start: null,
        stop: null
      },
      htmlbars: {
        start: null,
        stop: null
      }
    }
  },
  init: function() {
    this._super();
    this.setProperties({
      daTemplate: '<div>Name: {{name}}</div>',
      daContext: '{ "name" : "Tomster" }'
    });

    var self = this;

    Ember.subscribe("render", {
      before: function(name, timestamp, payload) {
        if (name.indexOf('render-time') !== -1) {
          var parts = name.split('.');
          self.set('time.render.'+parts[2]+'.start', timestamp);
        }
      },

      after: function(name, timestamp, payload) {
        if (name.indexOf('render-time') !== -1) {
          var parts = name.split('.');
          self.set('time.render.'+parts[2]+'.stop', timestamp);
        }
      }
    });
  },

  handlebarsRenderTime: Ember.computed('time.render.handlebars.start', 'time.render.handlebars.stop', function(){
    var start = this.get('time.render.handlebars.start');
    var stop = this.get('time.render.handlebars.stop');
    return stop - start;
  }),
  htmlbarsRenderTime: Ember.computed('time.render.htmlbars.start', 'time.render.htmlbars.stop', function(){
    var start = this.get('time.render.htmlbars.start');
    var stop = this.get('time.render.htmlbars.stop');
    return stop - start;
  }),

  compiledHandlebars: Ember.computed('daTemplate', function(){
    return Handlebars.compile(this.get('daTemplate'));
  }),
  compiledHTMLBars: Ember.computed('daTemplate', function(){
    return new Function('return ' + compileSpec(this.get('daTemplate')))();
  }),

  parseJson: Ember.observer('daContext', function(){
    try {
      this.set('jsonParseError', false);
      this.set('jsonContext', JSON.parse(this.get('daContext')));
    }
    catch (e) {
      this.set('jsonParseError', true);
      this.set('jsonContext', null);
    }
  }).on('init')
});
