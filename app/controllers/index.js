import Ember from 'ember';
import { compileSpec as htmlbarsCompileSpec } from 'htmlbars-compiler/compiler';

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
      before: function(name, timestamp) {
        if (name.indexOf('render-time') !== -1) {
          var parts = name.split('.');
          self.set('time.render.'+parts[2]+'.start', timestamp);
        }
      },

      after: function(name, timestamp) {
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

  precompiledHandlebars: Ember.computed('daTemplate', function(){
    try {
      return Ember.Handlebars.precompile(this.get('daTemplate'));
    }
    catch (e) {
      this.set('templateParseError', true);
    }
  }),

  precompiledHTMLBars: Ember.computed('daTemplate', function(){
    try {
      this.set('templateParseError', false);
      return htmlbarsCompileSpec(this.get('daTemplate'));
    }
    catch (e) {
      this.set('templateParseError', true);
      return "/* "+e.message+" */";
    }
  }),

  handlebarsTemplate: Ember.computed('precompiledHandlebars', function(){
    try {
      return Ember.Handlebars.template(eval(this.get('precompiledHandlebars')));
    }
    catch (e) {
      this.set('templateParseError', true);
    }
  }),

  htmlbarsTemplate: Ember.computed('precompiledHTMLBars', function(){
    return new Function('return ' + this.get('precompiledHTMLBars'))();
  }),

  parseJson: Ember.observer('daContext', 'daTemplate', function(){
    try {
      this.set('jsonParseError', false);
      this.set('jsonContext', JSON.parse(this.get('daContext')));
    }
    catch (e) {
      this.set('jsonParseError', true);
      this.set('jsonContext', null);
    }
  }).on('init'),

  highlightedHTMLBars: Ember.computed('precompiledHTMLBars', function() {
    // prettify will remove error comment
    if(this.get('templateParseError')){
      return this.highlight(this.get('precompiledHTMLBars'));
    }else{
      return this.highlight(this.prettify(this.get('precompiledHTMLBars')));
    }
  }),

  highlightedHandlebars: Ember.computed('precompiledHandlebars', function() {
    return this.highlight(this.prettify(this.get('precompiledHandlebars')));
  }),

  prettify: function(precompiled) {
    var ast = esprima.parse(precompiled);
    return escodegen.generate(ast, { format: { indent: { style: '  ' } } });
  },

  highlight: function(source) {
    return hljs.highlight('javascript', source).value;
  }

});
