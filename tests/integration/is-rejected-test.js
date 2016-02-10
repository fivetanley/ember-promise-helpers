import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - is-rejected helper', {
  integration: true,

  beforeEach() {

  }
});

test('evaluates to false until the promise is resolved', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-rejected promise)}}
      {{is-rejected promise}}
    {{else}}
      idk if it's rejected
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), `idk if it's rejected`, 'evaluates to false');

  deferred.rejected(new Error('noooo :('));

  return deferred.promise.catch(() => {
    assert.equal(this.$().text().trim(), 'true', 'value changes and template re-renders');
  });
});

test('renders false when given already fulfilled promise', function (assert) {
  let deferred = RSVP.defer();

  deferred.resolve('omg!');

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-rejected promise)}}
      {{is-rejected promise}}
    {{else}}
      promise is already fulfilled
    {{/if}}
  `);

  return deferred.promise.then(() => {
    assert.equal(this.$().text(), 'promise is already fulfilled');
  });
});

test('evaluates to true given an already rejected promise', function (assert) {
  let deferred = RSVP.defer();

  deferred.reject(new Error('nooooo :('));

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-rejected promise)}}
      {{is-rejected promise}}
    {{else}}
      totally rejected
    {{/if}}
  `);

  return deferred.promise.catch(() => {
    assert.equal(this.$().text(), 'true');
  });
});

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred1);

  this.render(hbs`
    {{if (is-rejected promise) 'rejected' 'not-rejected'}}
  `);

  deferred1.resolve('number 1');

  Ember.run.later(deferred2, 'resolve', 'number 2', 200);
  Ember.run.later(deferred3, 'reject', new Error('hi'), 300);

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  return RSVP.all([deferred3.promise, deferred2.promise, deferred3.promise]).finally(() => {
    assert.equal(this.$().text().trim(), 'rejected', 'the last set promise is rendered last even when other promises resolve first');
  });

});


