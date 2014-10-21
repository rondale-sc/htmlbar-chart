define("htmlbar-chart/app", [ "ember", "ember/resolver", "ember/load-initializers", "htmlbar-chart/config/environment", "exports" ], function(e, t, a, s, r) {
  "use strict";
  var n = e["default"], l = t["default"], i = a["default"], h = s["default"];
  n.MODEL_FACTORY_INJECTIONS = !0;
  var o = n.Application.extend({
    modulePrefix: h.modulePrefix,
    podModulePrefix: h.podModulePrefix,
    Resolver: l
  });
  i(o, h.modulePrefix), r["default"] = o;
}), define("htmlbar-chart/components/bar-chart", [ "ember", "exports" ], function(e, t) {
  "use strict";
  var a = e["default"];
  t["default"] = a.Component.extend({
    classNames: [ "chart" ],
    timescales: [ 1, 5, 10, 50, 100, 500, 1e3, 1e4 ],
    colors: [ "#5e9fb2", "#67ca85" ],
    timescaleForResults: function(e) {
      var t = a.$.map(e, function(e) {
        return e.value;
      }), s = Math.max.apply(null, t), r = this.timescales[0];
      return a.$.each(this.timescales, function(e) {
        return e > s ? (r = e, !1) : void 0;
      }), r;
    },
    styleForResult: function(e, t, a) {
      var s = a / e * 100;
      return "width: " + s + "%; background-color: " + this.colors[t] + ";";
    },
    metrics: a.computed("values", function() {
      var e = this;
      return a.$.map(this.get("values"), function(t, s) {
        var r = e.timescaleForResults(t);
        return {
          name: s,
          results: a.$.map(t, function(t, a) {
            return {
              name: t.name,
              value: t.value + " ms",
              style: e.styleForResult(r, a, t.value)
            };
          })
        };
      });
    })
  });
}), define("htmlbar-chart/controllers/index", [ "ember", "htmlbars-compiler/compiler", "htmlbar-chart/examples", "exports" ], function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
  "use strict";
  function renderTime(e) {
    return Ember.computed("time.render." + e + ".start", "time.render." + e + ".stop", function() {
      var t = this.get("time.render." + e + ".start"), a = this.get("time.render." + e + ".stop");
      return (a - t).toFixed(4);
    });
  }
  var Ember = __dependency1__["default"], htmlbarsCompileSpec = __dependency2__.compileSpec, examples = __dependency3__["default"];
  __exports__["default"] = Ember.Controller.extend({
    daTemplate: "",
    daContext: "",
    handlebarsJsonContext: null,
    htmlbarsJsonContext: null,
    jsonParseError: !0,
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
      this._super(), this.set("examples", this.exampleOptions()), this.subscribeToRender();
    },
    timer: Ember.observer(function() {
      {
        var e = this;
        setInterval(function() {
          e.set("jsonContext", Ember.$.extend({}, e.get("jsonContext")));
        }, 200);
      }
    }).on("init"),
    exampleOptions: function() {
      return Ember.$.map(examples, function(e, t) {
        return {
          text: e.name,
          value: t
        };
      });
    },
    subscribeToRender: function() {
      var e = this;
      Ember.subscribe("render", {
        before: function(t, a) {
          if (-1 !== t.indexOf("render-time")) {
            var s = t.split(".");
            e.set("time.render." + s[2] + ".start", a);
          }
        },
        after: function(t, a) {
          if (-1 !== t.indexOf("render-time")) {
            var s = t.split(".");
            e.set("time.render." + s[2] + ".stop", a);
          }
        }
      });
    },
    renderCounter: 0,
    renderTimes: [],
    pushRenderTimes: function(e) {
      this.incrementProperty("renderCounter");
      var t = this.get("renderCounter"), a = this;
      Ember.$.each(e, function(e, s) {
        var r = a.renderTimes[e];
        "undefined" == typeof r && (r = 0);
        var n = r * (t - 1);
        a.renderTimes[e] = (n + s) / t;
      });
    },
    chartValues: Ember.computed("htmlbarsRenderTime", "handlebarsRenderTime", function() {
      this.pushRenderTimes([ parseFloat(this.get("handlebarsRenderTime")), parseFloat(this.get("htmlbarsRenderTime")) ]);
      var e = "Render Avg (" + this.renderCounter + " samples)", t = {};
      return t[e] = [ {
        name: "Handlebars",
        value: this.renderTimes[0].toFixed(4)
      }, {
        name: "HTMLBars",
        value: this.renderTimes[1].toFixed(4)
      } ], t.Render = [ {
        name: "Handlebars",
        value: parseFloat(this.get("handlebarsRenderTime"))
      }, {
        name: "HTMLBars",
        value: parseFloat(this.get("htmlbarsRenderTime"))
      } ], t;
    }),
    changeExample: Ember.observer("selectedExample", function() {
      this.set("daTemplate", examples[this.get("selectedExample")].template), this.set("daContext", JSON.stringify(examples[this.get("selectedExample")].context || {}));
    }),
    handlebarsRenderTime: renderTime("handlebars"),
    htmlbarsRenderTime: renderTime("htmlbars"),
    precompiledHandlebars: Ember.computed("daTemplate", function() {
      try {
        return Ember.Handlebars.precompile(this.get("daTemplate"));
      } catch (e) {
        this.set("templateParseError", !0);
      }
    }),
    precompiledHTMLBars: Ember.computed("daTemplate", function() {
      try {
        return this.set("templateParseError", !1), htmlbarsCompileSpec(this.get("daTemplate"));
      } catch (e) {
        return this.set("templateParseError", !0), "/* " + e.message + " */";
      }
    }),
    handlebarsTemplate: Ember.computed("precompiledHandlebars", function() {
      try {
        return Ember.Handlebars.template(eval(this.get("precompiledHandlebars")));
      } catch (e) {
        this.set("templateParseError", !0);
      }
    }),
    htmlbarsTemplate: Ember.computed("precompiledHTMLBars", function() {
      return new Function("return " + this.get("precompiledHTMLBars"))();
    }),
    parseJson: Ember.observer("daContext", "daTemplate", function() {
      try {
        this.set("jsonParseError", !1), this.set("jsonContext", JSON.parse(this.get("daContext")));
      } catch (e) {
        this.set("jsonParseError", !0), this.set("jsonContext", null);
      }
    }).on("init"),
    highlightedHTMLBars: Ember.computed("precompiledHTMLBars", function() {
      return this.highlight(this.get("templateParseError") ? this.get("precompiledHTMLBars") : this.prettify(this.get("precompiledHTMLBars")));
    }),
    highlightedHandlebars: Ember.computed("precompiledHandlebars", function() {
      return this.highlight(this.prettify(this.get("precompiledHandlebars")));
    }),
    prettify: function(e) {
      var t = esprima.parse(e);
      return escodegen.generate(t, {
        format: {
          indent: {
            style: "  "
          }
        }
      });
    },
    highlight: function(e) {
      return hljs.highlight("javascript", e).value;
    }
  });
}), define("htmlbar-chart/examples", [ "exports" ], function(e) {
  "use strict";
  var t;
  t = [ {
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
  } ], e["default"] = t;
}), define("htmlbar-chart/initializers/export-application-global", [ "ember", "htmlbar-chart/config/environment", "exports" ], function(e, t, a) {
  "use strict";
  function s(e, t) {
    var a = r.String.classify(n.modulePrefix);
    n.exportApplicationGlobal && (window[a] = t);
  }
  var r = e["default"], n = t["default"];
  a.initialize = s, a["default"] = {
    name: "export-application-global",
    initialize: s
  };
}), define("htmlbar-chart/router", [ "ember", "htmlbar-chart/config/environment", "exports" ], function(e, t, a) {
  "use strict";
  var s = e["default"], r = t["default"], n = s.Router.extend({
    location: r.locationType
  });
  n.map(function() {}), a["default"] = n;
}), define("htmlbar-chart/templates/application", [ "ember", "exports" ], function(e, t) {
  "use strict";
  var a = e["default"];
  t["default"] = a.Handlebars.template(function(e, t, s, r, n) {
    this.compilerInfo = [ 4, ">= 1.0.0" ], s = this.merge(s, a.Handlebars.helpers), 
    n = n || {};
    var l, i = "";
    return l = s._triageMustache.call(t, "outlet", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }), (l || 0 === l) && n.buffer.push(l), n.buffer.push("\n"), i;
  });
}), define("htmlbar-chart/templates/components/bar-chart", [ "ember", "exports" ], function(e, t) {
  "use strict";
  var a = e["default"];
  t["default"] = a.Handlebars.template(function(e, t, s, r, n) {
    function l(e, t) {
      var a, r = "";
      return t.buffer.push("\n  <p>"), a = s._triageMustache.call(e, "name", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ e ],
        types: [ "ID" ],
        data: t
      }), (a || 0 === a) && t.buffer.push(a), t.buffer.push("</p>\n  "), a = s.each.call(e, "results", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: p.noop,
        fn: p.program(2, i, t),
        contexts: [ e ],
        types: [ "ID" ],
        data: t
      }), (a || 0 === a) && t.buffer.push(a), t.buffer.push("\n"), r;
    }
    function i(e, t) {
      var a, r = "";
      return t.buffer.push("\n    <div "), t.buffer.push(u(s["bind-attr"].call(e, {
        hash: {
          style: "style"
        },
        hashTypes: {
          style: "STRING"
        },
        hashContexts: {
          style: e
        },
        contexts: [],
        types: [],
        data: t
      }))), t.buffer.push(">"), a = s._triageMustache.call(e, "name", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ e ],
        types: [ "ID" ],
        data: t
      }), (a || 0 === a) && t.buffer.push(a), t.buffer.push(" <span class='value'>"), 
      a = s._triageMustache.call(e, "value", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [ e ],
        types: [ "ID" ],
        data: t
      }), (a || 0 === a) && t.buffer.push(a), t.buffer.push("</span></div>\n  "), r;
    }
    this.compilerInfo = [ 4, ">= 1.0.0" ], s = this.merge(s, a.Handlebars.helpers), 
    n = n || {};
    var h, o = "", u = this.escapeExpression, p = this;
    return h = s.each.call(t, "metrics", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      inverse: p.noop,
      fn: p.program(1, l, n),
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }), (h || 0 === h) && n.buffer.push(h), n.buffer.push("\n"), o;
  });
}), define("htmlbar-chart/templates/index", [ "ember", "exports" ], function(e, t) {
  "use strict";
  var a = e["default"];
  t["default"] = a.Handlebars.template(function(e, t, s, r, n) {
    this.compilerInfo = [ 4, ">= 1.0.0" ], s = this.merge(s, a.Handlebars.helpers), 
    n = n || {};
    var l, i, h, o = "", u = this.escapeExpression, p = s.helperMissing;
    return n.buffer.push('<div>\n  <div class="inline">\n    <p>Examples</p>\n    '), 
    n.buffer.push(u(s.view.call(t, "Ember.Select", {
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
        "class": t,
        content: t,
        optionLabelPath: t,
        optionValuePath: t,
        value: t
      },
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }))), n.buffer.push('\n  </div>\n  <div class="inline">\n    <p>Template</p>\n    '), 
    n.buffer.push(u((i = s.textarea || t && t.textarea, h = {
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
        value: t,
        "class": t,
        classNameBindings: t
      },
      contexts: [],
      types: [],
      data: n
    }, i ? i.call(t, h) : p.call(t, "textarea", h)))), n.buffer.push('\n  </div>\n  <div class="inline">\n    <p>Context</p>\n    '), 
    n.buffer.push(u((i = s.textarea || t && t.textarea, h = {
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
        value: t,
        "class": t,
        classNameBindings: t
      },
      contexts: [],
      types: [],
      data: n
    }, i ? i.call(t, h) : p.call(t, "textarea", h)))), n.buffer.push("\n  </div>\n</div>\n\n"), 
    n.buffer.push(u((i = s["bar-chart"] || t && t["bar-chart"], h = {
      hash: {
        values: "chartValues"
      },
      hashTypes: {
        values: "ID"
      },
      hashContexts: {
        values: t
      },
      contexts: [],
      types: [],
      data: n
    }, i ? i.call(t, h) : p.call(t, "bar-chart", h)))), n.buffer.push('\n\n<div class="inline">\n  <h2>Handlebars</h2>\n  <p>Render Time: '), 
    l = s._triageMustache.call(t, "handlebarsRenderTime", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }), (l || 0 === l) && n.buffer.push(l), n.buffer.push(' ms</p>\n  <div class="precompile">\n    <code class="hljs javascript">\n      '), 
    n.buffer.push(u(s._triageMustache.call(t, "highlightedHandlebars", {
      hash: {
        unescaped: "true"
      },
      hashTypes: {
        unescaped: "STRING"
      },
      hashContexts: {
        unescaped: t
      },
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }))), n.buffer.push("\n    </code>\n  </div>\n  "), n.buffer.push(u(s.view.call(t, {
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
        "class": t,
        instrumentName: t,
        template: t,
        context: t
      },
      contexts: [],
      types: [],
      data: n
    }))), n.buffer.push('\n</div>\n<div class="inline">\n  <h2>HTMLbars</h2>\n  <p>Render Time: '), 
    l = s._triageMustache.call(t, "htmlbarsRenderTime", {
      hash: {},
      hashTypes: {},
      hashContexts: {},
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }), (l || 0 === l) && n.buffer.push(l), n.buffer.push(' ms</p>\n  <div class="precompile">\n    <code class="hljs javascript">\n      '), 
    n.buffer.push(u(s._triageMustache.call(t, "highlightedHTMLBars", {
      hash: {
        unescaped: "true"
      },
      hashTypes: {
        unescaped: "STRING"
      },
      hashContexts: {
        unescaped: t
      },
      contexts: [ t ],
      types: [ "ID" ],
      data: n
    }))), n.buffer.push("\n    </code>\n  </div>\n  "), n.buffer.push(u(s.view.call(t, {
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
        "class": t,
        instrumentName: t,
        template: t,
        context: t
      },
      contexts: [],
      types: [],
      data: n
    }))), n.buffer.push("\n</div>\n"), o;
  });
}), define("htmlbar-chart/config/environment", [ "ember" ], function(e) {
  var t = "htmlbar-chart";
  try {
    var a = t + "/config/environment", s = e["default"].$('meta[name="' + a + '"]').attr("content"), r = JSON.parse(unescape(s));
    return {
      "default": r
    };
  } catch (n) {
    throw new Error('Could not read config from meta tag with name "' + a + '".');
  }
}), runningTests ? require("htmlbar-chart/tests/test-helper") : require("htmlbar-chart/app")["default"].create({});