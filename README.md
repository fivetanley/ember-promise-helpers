Ember Promise Helpers [![Build Status](https://travis-ci.org/fivetanley/ember-promise-helpers.svg?branch=master)](https://travis-ci.org/fivetanley/ember-promise-helpers)
------

# Installation

`ember install ember-promise-helpers`

# Description

When Ember's templates encounter a promise, it won't re-render it when
the promise is resolved or rejected. For an example of the problem:

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
subexpression. For example, you can pass it to a another helper...

```handlebars
{{#each (await model.comments) as |comment|}}
  {{comment.author}} wrote {{comment.text}}
{{/each}}
```

Or passing it to a component:

```handlebars
{{twitter-timeline users=(await user.following)}}
```

You can supply a `catch` action which will be called upon promise rejection:

```handlebars
{{#if (await model.author catch=(action 'error'))}}
  {{get (await model.author) 'name'}}
{{else}}
  {{#if authorError}}
    Error loading the author: {{authorError}}
  {{else}}
    No author!
  {{/if}}
{{/if}}
```

The component, controller or route would have the action:

```javascript
import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    error(err, promise) {
      this.set('authorError', err.message);
      // it could also log, redirect, etc
    }
  }

});
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

Resolves with `false` if the promise rejects or fails, false
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

Gives you the `error` or `reason` as to why a promise was rejected. Null
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

This would render "The error was whoops."

# Proposed Block Helper syntax (Not implemented!)

If you want to know when a promise becomes rejected or resolved, you can
use the `await-promise` component, which gives you an `error` property
if the promise becomes rejected (similar to calling `.catch` on a
promise.). Another `isFulfilled` argument is passed for you to handle
loading state:

```handlebars
{{#await-promise model.author as |author error isFulfilled|}}
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
