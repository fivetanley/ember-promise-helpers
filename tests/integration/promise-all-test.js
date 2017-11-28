import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;
let deferred1, deferred2;
let promise1, promise2;

moduleForComponent('integration - promise-all helper', {
  integration: true,

  beforeEach() {
    deferred1 = RSVP.defer();
    deferred2 = RSVP.defer();
    promise1 = deferred1.promise;
    promise2 = deferred2.promise;

    this.set('promise1', promise1);
    this.set('promise2', promise2);
  }
});

test('works with iawait helper', function (assert) {
  this.render(hbs`
    <span id="promise">{{await (promise-all promise1 promise2)}}</span>
  `);

  assert.equal(this.$('#promise').length, 1);
  assert.equal(this.$('#promise').text().trim(), '');

  const text = 'yass!';

  deferred1.resolve(text);

  return afterRender(promise1).then(() => {
    assert.equal(this.$('#promise').text().trim(), '', 're-renders when the first promise is resolved');
    deferred2.resolve(text);

    return afterRender(promise2);
  }).then(() => {
    // Promise.all() returns an array, Array.toString will be rendered as text ('yass!,yass!').
    assert.equal(this.$('#promise').text().trim(), `${text},${text}`, 're-renders when the second promise is resolved');
  });
});

test('works with is-fulfilled helper', function (assert) {
  this.render(hbs`
    {{#if (is-fulfilled (promise-all promise1 promise2))}}
      {{is-fulfilled (promise-all promise1 promise2)}}
    {{else}}
      idk if it's fulfilled
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), `idk if it's fulfilled`, 'evaluates to false');

  deferred1.resolve('yay!');

  return afterRender(promise1).then(() => {
    assert.equal(this.$().text().trim(), `idk if it's fulfilled`, 'evaluates to false');
    deferred2.resolve('yay!');

    return afterRender(promise2);
  }).then(() => {
    assert.equal(this.$().text().trim(), 'true', 'value changes and template re-renders');
  });
});


test('works with is-pending helper', function (assert) {
  this.render(hbs`
    {{#if (is-pending (promise-all promise1 promise2))}}
      Pending!
    {{else}}
      Done!
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is true before resolved');

  deferred1.resolve('resolved!');

  return afterRender(promise1).then(() => {
    assert.equal(this.$().text().trim(), 'Pending!', 'is-pending is true before resolved');
    deferred2.resolve('resolved!');

    return afterRender(promise2);
  }).then(() => {
    assert.equal(this.$().text().trim(), 'Done!', 'is-pending is false after resolved');
  });
});

test('works with is-rejected helper', function (assert) {
  this.render(hbs`
    {{#if (is-rejected (promise-all promise1 promise2))}}
      {{is-rejected (promise-all promise1 promise2)}}
    {{else}}
      idk if it's rejected
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), `idk if it's rejected`, 'evaluates to false');

  deferred1.reject(new Error('nope'));

  return afterRender(RSVP.all([promise1, promise2])).then(() => {
    assert.equal(this.$().text().trim(), 'true', 'value changes and template re-renders');
  });
});

test('works with promise-rejected-reason helper', function (assert) {
  this.render(hbs`
    {{#if (promise-rejected-reason (promise-all promise1 promise2))}}
      {{#with (promise-rejected-reason (promise-all promise1 promise2)) as |reason|}}
        {{reason.message}}
      {{/with}}
    {{else}}
      Probably not rejected yet.
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false until rejection is known');

  deferred1.reject(new Error('nope'));

  return afterRender(RSVP.all([promise1, promise2])).then(() => {
    assert.equal(this.$().text().trim(), 'nope', 'false until rejection is known');
  });
});
