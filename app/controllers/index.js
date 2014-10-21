import Ember from 'ember';
import { compileSpec as htmlbarsCompileSpec } from 'htmlbars-compiler/compiler';
import examples from '../examples';

function renderTime(name) {
  return Ember.computed('time.render.' + name + '.start', 'time.render.' + name + '.stop', function(){
    var start = this.get('time.render.' + name + '.start');
    var stop = this.get('time.render.' + name + '.stop');
    return (stop - start).toFixed(4);
  });
}

export default Ember.Controller.extend({
  daTemplate: '',
  daContext: '',
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
    this.set('examples', this.exampleOptions());
    this.subscribeToRender();
  },

  timer: Ember.observer(function(){
    var self = this;
    var timer = setInterval(function(){
      self.set('jsonContext', Ember.$.extend({},self.get('jsonContext')));
    }, 200);
    this.set('timerInterval', timer);
  }).on('init'),

  exampleOptions: function(){
    return Ember.$.map(examples, function(e, i){
      return { text: e.name, value: i };
    });
  },

  subscribeToRender: function(){
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

  renderCounter: 0,
  renderTimes: [],
  pushRenderTimes: function(times){
    this.incrementProperty('renderCounter');
    var count = this.get('renderCounter');
    var self = this;
    Ember.$.each(times, function(i, t){
      var avg = self.renderTimes[i];
      if(typeof(avg) == 'undefined'){
        avg = 0;
      }
      var totes = avg * (count - 1);
      self.renderTimes[i] = (totes + t)/count;
    });
  },

  chartValues: Ember.computed('htmlbarsRenderTime', 'handlebarsRenderTime', function(){
    this.pushRenderTimes([ parseFloat(this.get('handlebarsRenderTime')), parseFloat(this.get('htmlbarsRenderTime'))]);
    var label = 'Render Avg ('+this.renderCounter+' samples)';
    var values = {};

    values[label] = [
      {
        name: 'Handlebars',
        value: this.renderTimes[0].toFixed(4),
      },
      {
        name: 'HTMLBars',
        value: this.renderTimes[1].toFixed(4),
      }
    ];

    values['Render'] = [
      {
        name: 'Handlebars',
        value: parseFloat(this.get('handlebarsRenderTime')),
      },
      {
        name: 'HTMLBars',
        value: parseFloat(this.get('htmlbarsRenderTime'))
      }
    ];

    return values;
  }),

  changeExample: Ember.observer('selectedExample', function(){
    this.set('daTemplate', examples[this.get('selectedExample')].template);
    this.set('daContext', JSON.stringify(examples[this.get('selectedExample')].context || {}));
  }),

  handlebarsRenderTime: renderTime('handlebars'),

  htmlbarsRenderTime: renderTime('htmlbars'),

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
  },

});
