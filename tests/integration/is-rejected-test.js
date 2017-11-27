import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
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

  deferred.reject(new Error('noooo :('));

  return afterRender(deferred.promise).then(() => {
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

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'promise is already fulfilled');
  });
});

test('evaluates to true given an already rejected promise', function (assert) {
  // rejecting because ember fails the test immediately for some reason
  // when rejecting immediately... sigh
  let promise = new RSVP.Promise((_, reject) => {
    Ember.run.later(() => {
      reject(new Error('nooooo :('));
    }, 100);
  });

  return promise.catch(() => {

  }).then(() => {
    this.set('promise', promise);

    this.render(hbs`
      {{#if (is-rejected promise)}}
        {{is-rejected promise}}
      {{else}}
        totally rejected
      {{/if}}
    `);

    return afterRender(promise);
  }).then(() => {
    assert.equal(this.$().text().trim(), 'true');
  });
});

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred1.promise);

  this.render(hbs`
    {{if (is-rejected promise) 'rejected' 'not-rejected'}}
  `);

  deferred1.resolve('number 1');

  Ember.run.later(deferred2, 'resolve', 'number 2', 200);
  Ember.run.later(deferred3, 'reject', new Error('hi'), 300);

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  const promises = [deferred1, deferred2, deferred3].map(d => d.promise);

  return afterRender(RSVP.all(promises)).finally(() => {
    assert.equal(this.$().text().trim(), 'rejected', 'the last set promise is rendered last even when other promises resolve first');
  });

});


