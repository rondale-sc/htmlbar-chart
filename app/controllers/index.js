import Ember from 'ember';
import examples from '../examples';

function renderTime(name) {
  return Ember.computed('time.render.' + name + '.stop', function(){
    var start = this.get('time.render.' + name + '.start');
    var stop = this.get('time.render.' + name + '.stop');
    if(!start || !stop){
      return 0;
    }
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
      var handlebarsTurn = (Math.random(1.0) < 0.5);
      if(handlebarsTurn){
        self.set('handlebarsContext', Ember.$.extend({},self.get('jsonContext')));
      }else{
        self.set('htmlbarsContext', Ember.$.extend({},self.get('jsonContext')));
      }
    }, 100);
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
      // console.log('totes: ' +  totes, 't: ' + t, 'count: ' + count);
      self.renderTimes[i] = (totes + t)/count;
    });
  },

  chartValues: Ember.computed('htmlbarsRenderTime', 'handlebarsRenderTime', function(){
    var handlebarsRenderTime = parseFloat(this.get('handlebarsRenderTime'));
    var htmlbarsRenderTime = parseFloat(this.get('htmlbarsRenderTime'));

    var values = {};
    if (handlebarsRenderTime !== 0 && htmlbarsRenderTime !== 0) {
      this.pushRenderTimes([handlebarsRenderTime, htmlbarsRenderTime]);
      var label = 'Render Avg ('+this.renderCounter+' samples)';

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
    }
    return values;
  }),

  changeExample: Ember.observer('selectedExample', function(){

    this.set('daTemplate', examples[this.get('selectedExample')].template);
    this.set('daContext', JSON.stringify(examples[this.get('selectedExample')].context || {}));
    this.send('clearSamples');
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
      return Ember.__loader.require('htmlbars-compiler/compiler')['compileSpec'](this.get('daTemplate'));
    }
    catch (e) {
      this.set('templateParseError', true);
      return "/* "+e.message+" */";
    }
  }),

  handlebarsContext: {},

  handlebarsTemplate: Ember.computed('precompiledHandlebars', function(){
    try {
      return Ember.Handlebars.template(eval(this.get('precompiledHandlebars')));
    }
    catch (e) {
      this.set('templateParseError', true);
    }
  }),

  htmlbarsContext: {},

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
    if(this.get('templateParseError')){
      return this.highlight(this.get('precompiledHTMLBars'));
    }else{
      return this.highlight(this.prettify(this.get('precompiledHTMLBars')));
    }
  }),

  highlightedHandlebars: Ember.computed('precompiledHandlebars', function() {
    return this.highlight(this.prettify(this.get('precompiledHandlebars').main));
  }),

  prettify: function(precompiled) {
    var ast = esprima.parse(precompiled);
    return escodegen.generate(ast, { format: { indent: { style: '  ' } } });
  },

  highlight: function(source) {
    return hljs.highlight('javascript', source).value;
  },

  readyToDisplay: Ember.computed('daTemplate', 'daContext', function(){
    return !!this.get('daContext') && !!this.get('daTemplate');
  }),
  actions: {
    clearSamples: function() {
      this.set('renderCounter', 0);
      this.set('renderTimes', []);
    }
  }

});
