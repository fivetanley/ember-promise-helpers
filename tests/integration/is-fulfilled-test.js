import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - is-pending helper', {
  integration: true,

  beforeEach() {

  }
});

test('evaluates to false until the promise is resolved', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-fulfilled promise)}}
      {{is-fulfilled promise}}
    {{else}}
      idk if it's fulfilled
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), `idk if it's fulfilled`, 'evaluates to false');

  deferred.resolve('yay!');

  return deferred.promise.then(() => {
    assert.equal(this.$().text().trim(), 'true', 'value changes and template re-renders');
  });
});

test('renders true when given already fulfilled promise', function (assert) {
  let deferred = RSVP.defer();

  deferred.resolve('omg!');

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-fulfilled promise)}}
      {{is-fulfilled promise}}
    {{else}}
      idk if it's fulfilled
    {{/if}}
  `);

  return deferred.promise.then(() => {
    assert.equal(this.$().text(), 'true');
  });
});

test('evaluates to falsy given already rejected promise', function (assert) {
  let deferred = RSVP.defer();

  deferred.reject(new Error('nooooo :('));

  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (is-fulfilled promise)}}
      {{is-fulfilled promise}}
    {{else}}
      totally rejected
    {{/if}}
  `);

  return deferred.promise.catch(() => {
    assert.equal(this.$().text(), 'totally rejected');
  });
});

