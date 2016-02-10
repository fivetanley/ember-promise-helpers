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

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred1);

  this.render(hbs`
    {{if (is-pending promise) 'pending' 'not-pending'}}
  `);

  deferred1.resolve('number 1');

  Ember.run.later(deferred2, 'resolve', 'number 2', 200);
  // We don't resolve deferred3 so is-pending should be true

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  return RSVP.all([deferred1.promise, deferred2.promise]).finally(() => {
    assert.equal(this.$().text().trim(), 'pending', 'the last set promise is rendered last even when other promises resolve first');
  });

});

