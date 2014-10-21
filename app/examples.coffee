Examples = [
  {
    name: "nested html"
    template:
      """
      <h1>{{title}}</h1>
      <ul>
        <li>{{text}}</li>
        <li>{{{raw}}}</li>
      </ul>
      """
    context:
      title: "Hey!"
      text: "This is"
      raw: "a <em>list</em>"
  }
  {
    name: "a text node"
    template: "text node"
  }
  {
    name: "a mustache"
    template: "{{name}}"
    context:
      name: "mustache"
  }
  {
    name: "two mustaches side by side"
    template: "{{name1}}{{name2}}"
    context:
      name1: "must"
      name2: "ache"
  }
]

`export default Examples`
