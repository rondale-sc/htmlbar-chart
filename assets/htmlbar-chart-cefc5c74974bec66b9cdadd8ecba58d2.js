define("htmlbar-chart/app",["ember","ember/resolver","ember/load-initializers","htmlbar-chart/config/environment","exports"],function(e,t,a,r,n){"use strict";var s=e["default"],l=t["default"],i=a["default"],o=r["default"];s.MODEL_FACTORY_INJECTIONS=!0;var h=s.Application.extend({modulePrefix:o.modulePrefix,podModulePrefix:o.podModulePrefix,Resolver:l});i(h,o.modulePrefix),n["default"]=h}),define("htmlbar-chart/controllers/index",["ember","htmlbars-compiler/compiler","exports"],function(e,t,a){"use strict";var r=e["default"],n=t.compileSpec;a["default"]=r.Controller.extend({daTemplate:null,daContext:null,handlebarsJsonContext:null,htmlbarsJsonContext:null,jsonParseError:!0,time:{render:{handlebars:{start:null,stop:null},htmlbars:{start:null,stop:null}}},init:function(){this._super(),this.setProperties({daTemplate:"<div>Name: {{name}}</div>",daContext:'{ "name" : "Tomster" }'});var e=this;r.subscribe("render",{before:function(t,a){if(-1!==t.indexOf("render-time")){var r=t.split(".");e.set("time.render."+r[2]+".start",a)}},after:function(t,a){if(-1!==t.indexOf("render-time")){var r=t.split(".");e.set("time.render."+r[2]+".stop",a)}}})},handlebarsRenderTime:r.computed("time.render.handlebars.start","time.render.handlebars.stop",function(){var e=this.get("time.render.handlebars.start"),t=this.get("time.render.handlebars.stop");return t-e}),htmlbarsRenderTime:r.computed("time.render.htmlbars.start","time.render.htmlbars.stop",function(){var e=this.get("time.render.htmlbars.start"),t=this.get("time.render.htmlbars.stop");return t-e}),compiledHandlebars:r.computed("daTemplate",function(){return Handlebars.compile(this.get("daTemplate"))}),compiledHTMLBars:r.computed("daTemplate",function(){return new Function("return "+n(this.get("daTemplate")))()}),parseJson:r.observer("daContext",function(){try{this.set("jsonParseError",!1),this.set("jsonContext",JSON.parse(this.get("daContext")))}catch(e){this.set("jsonParseError",!0),this.set("jsonContext",null)}}).on("init")})}),define("htmlbar-chart/initializers/export-application-global",["ember","htmlbar-chart/config/environment","exports"],function(e,t,a){"use strict";function r(e,t){var a=n.String.classify(s.modulePrefix);s.exportApplicationGlobal&&(window[a]=t)}var n=e["default"],s=t["default"];a.initialize=r,a["default"]={name:"export-application-global",initialize:r}}),define("htmlbar-chart/router",["ember","htmlbar-chart/config/environment","exports"],function(e,t,a){"use strict";var r=e["default"],n=t["default"],s=r.Router.extend({location:n.locationType});s.map(function(){}),a["default"]=s}),define("htmlbar-chart/templates/application",["ember","exports"],function(e,t){"use strict";var a=e["default"];t["default"]=a.Handlebars.template(function(e,t,r,n,s){this.compilerInfo=[4,">= 1.0.0"],r=this.merge(r,a.Handlebars.helpers),s=s||{};var l,i="";return l=r._triageMustache.call(t,"outlet",{hash:{},hashTypes:{},hashContexts:{},contexts:[t],types:["ID"],data:s}),(l||0===l)&&s.buffer.push(l),s.buffer.push("\n"),i})}),define("htmlbar-chart/templates/index",["ember","exports"],function(e,t){"use strict";var a=e["default"];t["default"]=a.Handlebars.template(function(e,t,r,n,s){this.compilerInfo=[4,">= 1.0.0"],r=this.merge(r,a.Handlebars.helpers),s=s||{};var l,i,o,h="",u=r.helperMissing,p=this.escapeExpression;return s.buffer.push('<div class="inline">\n  <p>Template</p>\n  '),s.buffer.push(p((i=r.textarea||t&&t.textarea,o={hash:{value:"daTemplate"},hashTypes:{value:"ID"},hashContexts:{value:t},contexts:[],types:[],data:s},i?i.call(t,o):u.call(t,"textarea",o)))),s.buffer.push('\n</div>\n<div class="inline">\n  <p>Context</p>\n  '),s.buffer.push(p((i=r.textarea||t&&t.textarea,o={hash:{value:"daContext",classNameBindings:"jsonParseError"},hashTypes:{value:"ID",classNameBindings:"STRING"},hashContexts:{value:t,classNameBindings:t},contexts:[],types:[],data:s},i?i.call(t,o):u.call(t,"textarea",o)))),s.buffer.push("\n</div>\n"),s.buffer.push(p((i=r.input||t&&t.input,o={hash:{value:"jsonContext.name"},hashTypes:{value:"ID"},hashContexts:{value:t},contexts:[],types:[],data:s},i?i.call(t,o):u.call(t,"input",o)))),s.buffer.push('\n<hr/>\n<div class="inline">\n  <h2>Handlebars</h2>\n  <p>Render Time: '),l=r._triageMustache.call(t,"handlebarsRenderTime",{hash:{},hashTypes:{},hashContexts:{},contexts:[t],types:["ID"],data:s}),(l||0===l)&&s.buffer.push(l),s.buffer.push(' ms</p>\n  <div class="output">\n    <pre>\n      '),l=r._triageMustache.call(t,"compiledHandlebars",{hash:{},hashTypes:{},hashContexts:{},contexts:[t],types:["ID"],data:s}),(l||0===l)&&s.buffer.push(l),s.buffer.push("\n    </pre>\n  </div>\n  "),s.buffer.push(p(r.view.call(t,{hash:{"class":"output",instrumentName:"render-time.handlebars",template:"compiledHandlebars",context:"jsonContext"},hashTypes:{"class":"STRING",instrumentName:"STRING",template:"ID",context:"ID"},hashContexts:{"class":t,instrumentName:t,template:t,context:t},contexts:[],types:[],data:s}))),s.buffer.push('\n</div>\n<div class="inline">\n  <h2>HTMLbars</h2>\n  <p>Render Time: '),l=r._triageMustache.call(t,"htmlbarsRenderTime",{hash:{},hashTypes:{},hashContexts:{},contexts:[t],types:["ID"],data:s}),(l||0===l)&&s.buffer.push(l),s.buffer.push(' ms</p>\n  <div class="output">\n    <pre>\n      '),l=r._triageMustache.call(t,"compiledHTMLBars",{hash:{},hashTypes:{},hashContexts:{},contexts:[t],types:["ID"],data:s}),(l||0===l)&&s.buffer.push(l),s.buffer.push("\n    </pre>\n  </div>\n  "),s.buffer.push(p(r.view.call(t,{hash:{"class":"output",instrumentName:"render-time.htmlbars",template:"compiledHTMLBars",context:"jsonContext"},hashTypes:{"class":"STRING",instrumentName:"STRING",template:"ID",context:"ID"},hashContexts:{"class":t,instrumentName:t,template:t,context:t},contexts:[],types:[],data:s}))),s.buffer.push("\n</div>\n"),h})}),define("htmlbar-chart/config/environment",["ember"],function(e){var t="htmlbar-chart";try{var a=t+"/config/environment",r=e["default"].$('meta[name="'+a+'"]').attr("content"),n=JSON.parse(unescape(r));return{"default":n}}catch(s){throw new Error('Could not read config from meta tag with name "'+a+'".')}}),runningTests?require("htmlbar-chart/tests/test-helper"):require("htmlbar-chart/app")["default"].create({});