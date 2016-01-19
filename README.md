Ember Promise Helpers
------

# Installation

`ember install ember-promise-helpers`

# Description

When Ember's templates encounter a promise, it won't re-render it when
the promise is resolved or rejected. For an example of the problem:

```handlebars
{{#if model.author}}
  The author is: {{author.name}}
{{else}}
  No author!
{{/if}}
```

If `model.author` is a promise (like a an Ember Data `belongsTo`
relationship), the template will always contain the text: "The author
is:", rather than "No author!".

Ember Promise Helpers allow you to work with Promises easily in your
Ember templates, without wrapping your objects with something like
`Ember.PromiseProxyMixin` in the Route, Controller, or Component.

# Example Usage

```handlebars
{{#if (await model.author)}}
  {{author.name}}
{{else}}
  No author!
{{/if}}
```

If you want to know when a promise becomes rejected or resolved, you can
use the `await-promise` component, which gives you an `error` property
if the promise becomes rejected (similar to calling `.catch` on a
promise.). Another `isFulfilled` argument is passed for you to handle
loading state:

```handlebars
{{#await-promise model.author as |author, error, isFulfilled|}}
  {{#if isFulfilled}}

    {{#unless error}}

      {{#if author}}
        The author is: {{author.name}}
      {{{else}}
        There is no author!
      {{/if}}

    {{else}}
      Oops! The error was {{error.message}}
    {{/unless}}

  {{else}}
    Loading...
  {{/if}}
{{/await-promise}}
```

## Development Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
