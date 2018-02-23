import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('integration - is-pending helper', {
  integration: true
});

test('is true until the promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-pending promise)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is true before resolved');

  deferred.resolve('resolved!');

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is false after resolved');
  });
});

test('is true until the promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-pending promise)}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is false before resolved');

  deferred.reject(new Error('oh noes'));

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is true after resolved');
  });
});

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred1.promise);

  this.render(hbs`
    {{if (is-pending promise) 'pending' 'not-pending'}}
  `);

  deferred1.resolve('number 1');

  later(deferred2, 'resolve', 'number 2', 200);
  // We don't resolve deferred3 so is-pending should be true

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  const promises = [deferred1, deferred2].map(d => d.promise);

  return afterRender(RSVP.all(promises)).then(() => {
    assert.equal(this.$().text().trim(), 'pending', 'the last set promise is rendered last even when other promises resolve first');
  });

});

