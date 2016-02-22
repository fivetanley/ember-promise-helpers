import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
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

  return afterRender(deferred.promise).then(() => {
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

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'true');
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

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$().text().trim(), 'totally rejected');
  });
});

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred1);

  this.render(hbs`
    {{if (is-fulfilled promise) 'fulfilled' 'rejected'}}
  `);

  deferred1.resolve('number 1');

  Ember.run.later(deferred2, 'resolve', 'number 2', 200);
  Ember.run.later(deferred3, 'reject', new Error('nope'));

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  const allPromises = [deferred1, deferred2, deferred3].map(d => d.promise);

  return afterRender(RSVP.all(allPromises)).finally(() => {
    assert.equal(this.$().text().trim(), 'rejected', 'the last set promise is rendered last even when other promises resolve first');
  });

});

