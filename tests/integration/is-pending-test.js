import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - is-pending helper', {
  integration: true
});

test('is true until the promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-pending)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is false before resolved');

  deferred.resolve('resolved!');

  return deferred.promise.then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is true after resolved');
  });
});

test('is true until the promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-pending)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is false before resolved');

  deferred.reject(new Error('oh noes'));

  return deferred.promise.catch(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is true after resolved');
  });
});
