Ember Promise Helpers ![main branch build](https://github.com/fivetanley/ember-promise-helpers/workflows/test/badge.svg?branch=main)
------

# Installation

`ember install ember-promise-helpers`

# Description

When Ember's templates encounter a promise, it won't re-render it when
the promise is resolved or rejected. For an example of the problem (where model is a specific single model, not an RSVP.hash):


```handlebars

{{#if model.author}}
  The author is: {{model.author.name}}
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

## await

```handlebars
{{#if (await model.author)}}
  {{get (await model.author) 'name'}}
{{else}}
  No author!
{{/if}}
```

The `await` helper also works anywhere, because it's just a Handlebars
subexpression. For example, you can pass it to another helper...

```handlebars
{{#each (await model.comments) as |comment|}}
  {{comment.author}} wrote {{comment.text}}
{{/each}}
```

Or pass it to a component:

```handlebars
{{twitter-timeline users=(await user.following)}}
```

Or use it by itself:

```handlebars
{{await model.title}}
```

## is-pending

Resolves with `false` if the promise resolved or rejected, otherwise
true until the promise resolves or rejects.

```handlebars
  {{#if (is-pending promise)}}
    <img src="loading.gif"/>
  {{else}}
    Loaded!
  {{/if}}
```

## is-rejected

Resolves with `true` if the promise rejects or fails, false
otherwise. Initial value is `null` until the promise is resolved.

```handlebars
  {{#unless (is-pending promise)}}
    {{#if (is-rejected promise)}}
      rejected! :(((
    {{/if}}
  {{/unless}}
```

## is-fulfilled

Resolves with `true` if the promise resolved successfully, false
otherwise. Initial value is `null` until the promise is resolved.

```handlebars
  {{#unless (is-pending promise)}}
    {{#if (is-fulfilled promise)}}
      Yay it worked!
    {{else}}
      Oh :(
    {{/if}}
  {{/unless}}
```

## promise-rejected-reason

Gives you the `error` or `reason` as to why a promise was rejected. `Null`
until the promise rejects or if the promise resolves. For example:

```javascript
// app/controllers/index.js
import Ember from 'ember';

export default Ember.Controller.extend({
  promise: Ember.computed(function() {
    return Ember.RSVP.reject(new Error('whoops'));
  })
});
```

```handlebars
{{! app/templates/index.js }}

{{#if (is-rejected promise)}}
  The error was {{get (promise-rejected-reason promise) 'message'}}.
{{/if}}
```

## promise-all

Uses the `Ember.RSVP.all` function to create a promise.
It also accepts `1..n` promises as arguments or an array as first argument.


```handlebars
  {{#if (is-pending (promise-all promise1 promise2))}}
    <img src="loading.gif"/>
  {{else}}
    Loaded!
  {{/if}}
```


```handlebars
  {{#if (is-pending (promise-all promiseArray))}}
    <img src="loading.gif"/>
  {{else}}
    Loaded!
  {{/if}}
```

## promise-hash

Uses the `Ember.RSVP.hash` function to create a promise.


```handlebars
  {{#if (is-pending (promise-hash foo=promise1 bar=promise2))}}
    <img src="loading.gif"/>
  {{else}}
    Loaded!
  {{/if}}
```

This would render "The error was whoops."

## Installation

* `git clone <repository-url>`
* `cd ember-promise-helpers`
* `yarn install`

## Linting

* `yarn lint`
* `yarn lint:fix`

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
