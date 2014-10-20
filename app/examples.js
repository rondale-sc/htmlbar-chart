/*jshint multistr: true */
export default [
  {
    name: "nested html",
    template: "<h1>{{title}}</h1>\n<ul>\n<li>{{text}}</li>\n<li>{{{raw}}}</li>\n</ul>",
    context: { title: 'Hey!', text: 'This is', raw: 'a <em>list</em>' }
  },
  {
    name: "each helper",
    template: "<h1>Hey {{name}}!</h1>\n<ul>\n{{#each items}}\n<li>\n{{value}}\n</li>\n{{/each}}\n</ul>",
    context: {
      name: "Ember",
      items: [
        { value: "You ROCK!" },
        { value: "Lets get together" },
      ]
    }
  },
  {
    name: "a text node",
    template: "text node"
  },
  {
    name: "a mustache",
    template: "{{name}}",
    context: { name: 'mustache' }
  },
  {
    name: "two mustaches side by side",
    template: "{{name1}}{{name2}}",
    context: { name1: 'must', name2: 'ache' }
  },
  {
    name: "nested ifs",
    template: "{{#if foo}}{{#if foo}}{{baz}}{{/if}}{{/if}}",
    context: { foo: true, baz: 'baz' }
  },
  {
    name: "mustache in tag",
    template: "<button {{action 'clicked'}}>\n{{title}}\n</button>",
    context: { title: 'Click me!' }
  },
];
