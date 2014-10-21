import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['chart'],
  timescales: [1, 5, 10, 50, 100, 500, 1000, 10000],
  colors: [ '#5e9fb2', '#67ca85' ],
  timescaleForResults: function(results){
    var values = Ember.$.map(results, function(r){
      return r.value;
    });
    var max = Math.max.apply(null, values);
    var timescale = this.timescales[0];
    Ember.$.each(this.timescales, function(t){
      if(t > max){
        timescale = t;
        return false;
      }
    });
    return timescale;
  },

  styleForResult: function(timescale, i, result){
    var percent = (result/timescale) * 100;
    return 'width: '+percent+'%; background-color: '+this.colors[i]+';';
  },

  metrics: Ember.computed('values', function(){
    var self = this;
    return Ember.$.map(this.get('values'), function(results, name){
      var timescale = self.timescaleForResults(results);
      return {
        name: name,
        results: Ember.$.map(results, function(r, i){
          return {
            name: r.name,
            value: r.value + ' ms',
            style: self.styleForResult(timescale, i, r.value),
          };
        })
      };
    });
  }),



});
