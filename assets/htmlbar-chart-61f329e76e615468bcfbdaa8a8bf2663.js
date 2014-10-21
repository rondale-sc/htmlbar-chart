define("htmlbar-chart/app", [ "ember", "ember/resolver", "ember/load-initializers", "htmlbar-chart/config/environment", "exports" ], function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  var Resolver = __dependency2__["default"];
  var loadInitializers = __dependency3__["default"];
  var config = __dependency4__["default"];
  Ember.MODEL_FACTORY_INJECTIONS = true;
  var App = Ember.Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver: Resolver
  });
  loadInitializers(App, config.modulePrefix);
  __exports__["default"] = App;
});

define("htmlbar-chart/components/bar-chart", [ "ember", "exports" ], function(__dependency1__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  __exports__["default"] = Ember.Component.extend({
    classNames: [ "chart" ],
    timescales: [ 1, 5, 10, 50, 100, 500, 1e3, 1e4 ],
    colors: [ "#5e9fb2", "#67ca85" ],
    timescaleForResults: function(results) {
      var values = Ember.$.map(results, function(r) {
        return r.value;
      });
      var max = Math.max.apply(null, values);
      var timescale = this.timescales[0];
      Ember.$.each(this.timescales, function(t) {
        if (t > max) {
          timescale = t;
          return false;
        }
      });
      return timescale;
    },
    styleForResult: function(timescale, i, result) {
      var percent = result / timescale * 100;
      return "width: " + percent + "%; background-color: " + this.colors[i] + ";";
    },
    metrics: Ember.computed("values", function() {
      var self = this;
      return Ember.$.map(this.get("values"), function(results, name) {
        var timescale = self.timescaleForResults(results);
        return {
          name: name,
          results: Ember.$.map(results, function(r, i) {
            return {
              name: r.name,
              value: r.value + " ms",
              style: self.styleForResult(timescale, i, r.value)
            };
          })
        };
      });
    })
  });
});

define("htmlbar-chart/controllers/index", [ "ember", "htmlbars-compiler/compiler", "htmlbar-chart/examples", "exports" ], function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  var htmlbarsCompileSpec = __dependency2__.compileSpec;
  var examples = __dependency3__["default"];
  function renderTime(name) {
    return Ember.computed("time.render." + name + ".start", "time.render." + name + ".stop", function() {
      var start = this.get("time.render." + name + ".start");
      var stop = this.get("time.render." + name + ".stop");
      return (stop - start).toFixed(4);
    });
  }
  __exports__["default"] = Ember.Controller.extend({
    daTemplate: "",
    daContext: "",
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
      this.set("examples", this.exampleOptions());
      this.subscribeToRender();
    },
    timer: Ember.observer(function() {
      var self = this;
      var timer = setInterval(function() {
        self.set("jsonContext", Ember.$.extend({}, self.get("jsonContext")));
      }, 200);
    }).on("init"),
    exampleOptions: function() {
      return Ember.$.map(examples, function(e, i) {
        return {
          text: e.name,
          value: i
        };
      });
    },
    subscribeToRender: function() {
      var self = this;
      Ember.subscribe("render", {
        before: function(name, timestamp) {
          if (name.indexOf("render-time") !== -1) {
            var parts = name.split(".");
            self.set("time.render." + parts[2] + ".start", timestamp);
          }
        },
        after: function(name, timestamp) {
          if (name.indexOf("render-time") !== -1) {
            var parts = name.split(".");
            self.set("time.render." + parts[2] + ".stop", timestamp);
          }
        }
      });
    },
    renderCounter: 0,
    renderTimes: [],
    pushRenderTimes: function(times) {
      this.incrementProperty("renderCounter");
      var count = this.get("renderCounter");
      var self = this;
      Ember.$.each(times, function(i, t) {
        var avg = self.renderTimes[i];
        if (typeof avg == "undefined") {
          avg = 0;
        }
        var totes = avg * (count - 1);
        self.renderTimes[i] = (totes + t) / count;
      });
    },
    chartValues: Ember.computed("htmlbarsRenderTime", "handlebarsRenderTime", function() {
      this.pushRenderTimes([ parseFloat(this.get("handlebarsRenderTime")), parseFloat(this.get("htmlbarsRenderTime")) ]);
      var label = "Render Avg (" + this.renderCounter + " samples)";
      var values = {};
      values[label] = [ {
        name: "Handlebars",
        value: this.renderTimes[0].toFixed(4)
      }, {
        name: "HTMLBars",
        value: this.renderTimes[1].toFixed(4)
      } ];
      values["Render"] = [ {
        name: "Handlebars",
        value: parseFloat(this.get("handlebarsRenderTime"))
      }, {
        name: "HTMLBars",
        value: parseFloat(this.get("htmlbarsRenderTime"))
      } ];
      return values;
    }),
    changeExample: Ember.observer("selectedExample", function() {
      this.set("daTemplate", examples[this.get("selectedExample")].template);
      this.set("daContext", JSON.stringify(examples[this.get("selectedExample")].context || {}));
    }),
    handlebarsRenderTime: renderTime("handlebars"),
    htmlbarsRenderTime: renderTime("htmlbars"),
    precompiledHandlebars: Ember.computed("daTemplate", function() {
      try {
        return Ember.Handlebars.precompile(this.get("daTemplate"));
      } catch (e) {
        this.set("templateParseError", true);
      }
    }),
    precompiledHTMLBars: Ember.computed("daTemplate", function() {
      try {
        this.set("templateParseError", false);
        return htmlbarsCompileSpec(this.get("daTemplate"));
      } catch (e) {
        this.set("templateParseError", true);
        return "/* " + e.message + " */";
      }
    }),
    handlebarsTemplate: Ember.computed("precompiledHandlebars", function() {
      try {
        return Ember.Handlebars.template(eval(this.get("precompiledHandlebars")));
      } catch (e) {
        this.set("templateParseError", true);
      }
    }),
    htmlbarsTemplate: Ember.computed("precompiledHTMLBars", function() {
      return new Function("return " + this.get("precompiledHTMLBars"))();
    }),
    parseJson: Ember.observer("daContext", "daTemplate", function() {
      try {
        this.set("jsonParseError", false);
        this.set("jsonContext", JSON.parse(this.get("daContext")));
      } catch (e) {
        this.set("jsonParseError", true);
        this.set("jsonContext", null);
      }
    }).on("init"),
    highlightedHTMLBars: Ember.computed("precompiledHTMLBars", function() {
      if (this.get("templateParseError")) {
        return this.highlight(this.get("precompiledHTMLBars"));
      } else {
        return this.highlight(this.prettify(this.get("precompiledHTMLBars")));
      }
    }),
    highlightedHandlebars: Ember.computed("precompiledHandlebars", function() {
      return this.highlight(this.prettify(this.get("precompiledHandlebars")));
    }),
    prettify: function(precompiled) {
      var ast = esprima.parse(precompiled);
      return escodegen.generate(ast, {
        format: {
          indent: {
            style: "  "
          }
        }
      });
    },
    highlight: function(source) {
      return hljs.highlight("javascript", source).value;
    }
  });
});

define("htmlbar-chart/examples", [ "exports" ], function(__exports__) {
  "use strict";
  var Examples;
  Examples = [ {
    name: "nested html",
    template: "<h1>{{title}}</h1>\n<ul>\n  <li>{{text}}</li>\n  <li>{{{raw}}}</li>\n</ul>",
    context: {
      title: "Hey!",
      text: "This is",
      raw: "a <em>list</em>"
    }
  }, {
    name: "a text node",
    template: "text node"
  }, {
    name: "a mustache",
    template: "{{name}}",
    context: {
      name: "mustache"
    }
  }, {
    name: "two mustaches side by side",
    template: "{{name1}}{{name2}}",
    context: {
      name1: "must",
      name2: "ache"
    }
  } ];
  __exports__["default"] = Examples;
});

define("htmlbar-chart/initializers/export-application-global", [ "ember", "htmlbar-chart/config/environment", "exports" ], function(__dependency1__, __dependency2__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  var config = __dependency2__["default"];
  function initialize(container, application) {
    var classifiedName = Ember.String.classify(config.modulePrefix);
    if (config.exportApplicationGlobal) {
      window[classifiedName] = application;
    }
  }
  __exports__.initialize = initialize;
  __exports__["default"] = {
    name: "export-application-global",
    initialize: initialize
  };
});

define("htmlbar-chart/router", [ "ember", "htmlbar-chart/config/environment", "exports" ], function(__dependency1__, __dependency2__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  var config = __dependency2__["default"];
  var Router = Ember.Router.extend({
    location: config.locationType
  });
  Router.map(function() {});
  __exports__["default"] = Router;
});

define("htmlbar-chart/templates/application", [ "ember", "exports" ], function(__dependency1__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [ 4, ">= 1.0.0" ];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = "", stack1;
    stack1 = helpers._triageMustache.call(depth0, "outlet", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    });
    if (stack1 || stack1 === 0) {
      data.buffer.push(stack1);
    }
    data.buffer.push("\n");
    return buffer;
  });
});

define("htmlbar-chart/templates/components/bar-chart", [ "ember", "exports" ], function(__dependency1__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [ 4, ">= 1.0.0" ];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = "", stack1, escapeExpression = this.escapeExpression, self = this;
    function program1(depth0, data) {
      var buffer = "", stack1;
      data.buffer.push("\n  <p>");
      stack1 = helpers._triageMustache.call(depth0, "name", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ depth0 ],
        types: [ "ID" ],
        data: data
      });
      if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
      }
      data.buffer.push("</p>\n  ");
      stack1 = helpers.each.call(depth0, "results", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(2, program2, data),
        contexts: [ depth0 ],
        types: [ "ID" ],
        data: data
      });
      if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
      }
      data.buffer.push("\n");
      return buffer;
    }
    function program2(depth0, data) {
      var buffer = "", stack1;
      data.buffer.push("\n    <div ");
      data.buffer.push(escapeExpression(helpers["bind-attr"].call(depth0, {
        hash: {
          style: "style"
        },
        hashTypes: {
          style: "STRING"
        },
        hashContexts: {
          style: depth0
        },
        contexts: [],
        types: [],
        data: data
      })));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "name", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ depth0 ],
        types: [ "ID" ],
        data: data
      });
      if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
      }
      data.buffer.push(" <span class='value'>");
      stack1 = helpers._triageMustache.call(depth0, "value", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ depth0 ],
        types: [ "ID" ],
        data: data
      });
      if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
      }
      data.buffer.push("</span></div>\n  ");
      return buffer;
    }
    stack1 = helpers.each.call(depth0, "metrics", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      inverse: self.noop,
      fn: self.program(1, program1, data),
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    });
    if (stack1 || stack1 === 0) {
      data.buffer.push(stack1);
    }
    data.buffer.push("\n");
    return buffer;
  });
});

define("htmlbar-chart/templates/index", [ "ember", "exports" ], function(__dependency1__, __exports__) {
  "use strict";
  var Ember = __dependency1__["default"];
  __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [ 4, ">= 1.0.0" ];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = "", stack1, helper, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing;
    data.buffer.push('<div>\n  <div class="inline">\n    <p>Examples</p>\n    ');
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
      hash: {
        "class": "select",
        content: "examples",
        optionLabelPath: "content.text",
        optionValuePath: "content.value",
        value: "selectedExample"
      },
      hashTypes: {
        "class": "STRING",
        content: "ID",
        optionLabelPath: "STRING",
        optionValuePath: "STRING",
        value: "ID"
      },
      hashContexts: {
        "class": depth0,
        content: depth0,
        optionLabelPath: depth0,
        optionValuePath: depth0,
        value: depth0
      },
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    })));
    data.buffer.push('\n  </div>\n  <div class="inline">\n    <p>Template</p>\n    ');
    data.buffer.push(escapeExpression((helper = helpers.textarea || depth0 && depth0.textarea, 
    options = {
      hash: {
        value: "daTemplate",
        "class": "template-input",
        classNameBindings: "templateParseError"
      },
      hashTypes: {
        value: "ID",
        "class": "STRING",
        classNameBindings: "STRING"
      },
      hashContexts: {
        value: depth0,
        "class": depth0,
        classNameBindings: depth0
      },
      contexts: [],
      types: [],
      data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
    data.buffer.push('\n  </div>\n  <div class="inline">\n    <p>Context</p>\n    ');
    data.buffer.push(escapeExpression((helper = helpers.textarea || depth0 && depth0.textarea, 
    options = {
      hash: {
        value: "daContext",
        "class": "context-input",
        classNameBindings: "jsonParseError"
      },
      hashTypes: {
        value: "ID",
        "class": "STRING",
        classNameBindings: "STRING"
      },
      hashContexts: {
        value: depth0,
        "class": depth0,
        classNameBindings: depth0
      },
      contexts: [],
      types: [],
      data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
    data.buffer.push("\n  </div>\n</div>\n\n");
    data.buffer.push(escapeExpression((helper = helpers["bar-chart"] || depth0 && depth0["bar-chart"], 
    options = {
      hash: {
        values: "chartValues"
      },
      hashTypes: {
        values: "ID"
      },
      hashContexts: {
        values: depth0
      },
      contexts: [],
      types: [],
      data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "bar-chart", options))));
    data.buffer.push('\n\n<div class="inline">\n  <h2>Handlebars</h2>\n  <p>Render Time: ');
    stack1 = helpers._triageMustache.call(depth0, "handlebarsRenderTime", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    });
    if (stack1 || stack1 === 0) {
      data.buffer.push(stack1);
    }
    data.buffer.push(' ms</p>\n  <div class="precompile">\n    <code class="hljs javascript">\n      ');
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "highlightedHandlebars", {
      hash: {
        unescaped: "true"
      },
      hashTypes: {
        unescaped: "STRING"
      },
      hashContexts: {
        unescaped: depth0
      },
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    })));
    data.buffer.push("\n    </code>\n  </div>\n  ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, {
      hash: {
        "class": "rendered",
        instrumentName: "render-time.handlebars",
        template: "handlebarsTemplate",
        context: "jsonContext"
      },
      hashTypes: {
        "class": "STRING",
        instrumentName: "STRING",
        template: "ID",
        context: "ID"
      },
      hashContexts: {
        "class": depth0,
        instrumentName: depth0,
        template: depth0,
        context: depth0
      },
      contexts: [],
      types: [],
      data: data
    })));
    data.buffer.push('\n</div>\n<div class="inline">\n  <h2>HTMLbars</h2>\n  <p>Render Time: ');
    stack1 = helpers._triageMustache.call(depth0, "htmlbarsRenderTime", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    });
    if (stack1 || stack1 === 0) {
      data.buffer.push(stack1);
    }
    data.buffer.push(' ms</p>\n  <div class="precompile">\n    <code class="hljs javascript">\n      ');
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "highlightedHTMLBars", {
      hash: {
        unescaped: "true"
      },
      hashTypes: {
        unescaped: "STRING"
      },
      hashContexts: {
        unescaped: depth0
      },
      contexts: [ depth0 ],
      types: [ "ID" ],
      data: data
    })));
    data.buffer.push("\n    </code>\n  </div>\n  ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, {
      hash: {
        "class": "rendered",
        instrumentName: "render-time.htmlbars",
        template: "htmlbarsTemplate",
        context: "jsonContext"
      },
      hashTypes: {
        "class": "STRING",
        instrumentName: "STRING",
        template: "ID",
        context: "ID"
      },
      hashContexts: {
        "class": depth0,
        instrumentName: depth0,
        template: depth0,
        context: depth0
      },
      contexts: [],
      types: [],
      data: data
    })));
    data.buffer.push("\n</div>\n");
    return buffer;
  });
});

define("htmlbar-chart/config/environment", [ "ember" ], function(Ember) {
  var prefix = "htmlbar-chart";
  try {
    var metaName = prefix + "/config/environment";
    var rawConfig = Ember["default"].$('meta[name="' + metaName + '"]').attr("content");
    var config = JSON.parse(unescape(rawConfig));
    return {
      "default": config
    };
  } catch (err) {
    throw new Error('Could not read config from meta tag with name "' + metaName + '".');
  }
});

if (runningTests) {
  require("htmlbar-chart/tests/test-helper");
} else {
  require("htmlbar-chart/app")["default"].create({});
}