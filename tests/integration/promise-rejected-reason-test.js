import RSVP from 'rsvp';
import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('integration - promise-rejected-reason error', {
  integration: true
});

test('is false until the promise rejects', function (assert) {
  let deferred = RSVP.defer();
  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (promise-rejected-reason promise)}}
      {{#with (promise-rejected-reason promise) as |reason|}}
        {{reason.message}}
      {{/with}}
    {{else}}
      Probably not rejected yet.
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false until rejection is known');

  deferred.reject(new Error('nope'));

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'nope', 'false until rejection is known');
  });
});

test('is false when the promise resolves', function (assert) {
  let deferred = RSVP.defer();
  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (promise-rejected-reason promise)}}
      {{#with (promise-rejected-reason promise) as |reason|}}
        {{reason.message}}
      {{/with}}
    {{else}}
      Probably not rejected yet.
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false before promise resolves');

  deferred.resolve(true);

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false after promise resolves');
  });
});
