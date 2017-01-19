import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - are-pending helper', {
  integration: true
});

test('is true until all the promise resolves', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();

  this.set('promise1', deferred1.promise);
  this.set('promise2', deferred2.promise);

  this.render(hbs`
    {{#if (are-pending promise1 promise2)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is true before resolved');

  deferred1.resolve('resolved!');

  return afterRender(deferred1.promise).then(() => {
    assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is false after resolved');

    deferred2.resolve('resolved!');

    return afterRender(deferred2.promise);
  }).then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is false after resolved');
  });
});

test('is true until some promise rejects', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();

  this.set('promise1', deferred1.promise);
  this.set('promise2', deferred2.promise);

  this.render(hbs`
    {{#if (are-pending promise1 promise2)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is false before resolved');

  deferred1.resolve(new Error('oh noes'));
  deferred2.resolve(new Error('oh noes'));

  return afterRender(deferred1.promise).then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is true after resolved');
  });
});

test('always renders with the last promises set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();
  let deferred4 = RSVP.defer();

  this.set('promise1', deferred1.promise);
  this.set('promise2', deferred2.promise);

  this.render(hbs`
    {{if (are-pending promise1 promise2) 'pending' 'not-pending'}}
  `);

  deferred1.resolve('number 1');
  deferred2.resolve('number 2');

  Ember.run.later(deferred3, 'resolve', 'number 3', 200);
  // We don't resolve deferred4 so are-pending should be true

  this.set('promise1', deferred3.promise);
  this.set('promise2', deferred4.promise);

  const promises = [deferred1, deferred2].map(d => d.promise);

  return afterRender(RSVP.all(promises)).then(() => {
    assert.equal(this.$().text().trim(), 'pending', 'the last set promise is rendered last even when other promises resolve first');
  });

});
