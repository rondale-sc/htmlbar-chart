/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  vendorFiles: {
    'handlebars': 'bower_components/handlebars/handlebars.js',
    'ember.js': 'vendor/ember/ember.js'
  }
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('vendor/htmlbars/htmlbars-compiler.amd.js', {
  exports: {
    'htmlbars-compiler/compiler': ['default']
  }
});

app.import('vendor/highlight/highlight.min.js');
app.import('vendor/escodegen/escodegen.browser.js');
app.import('vendor/esprima/esprima.js');

module.exports = app.toTree();
