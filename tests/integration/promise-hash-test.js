import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;
let deferred1, deferred2;
let promise1, promise2;

moduleForComponent('integration - promise-hash helper', {
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
    {{#with (await (promise-hash promise1=promise1 promise2=promise2)) as |promiseAll|}}
      <span id="promise1">{{promiseAll.promise1}}</span>
      <span id="promise2">{{promiseAll.promise2}}</span>
    {{/with}}
  `);

  assert.equal(this.$('#promise1').length, 0);
  assert.equal(this.$('#promise2').length, 0);

  deferred1.resolve('promise1 resolved');

  return afterRender(promise1).then(() => {
    assert.equal(this.$('#promise1').text().trim(), '', 're-renders when the first promise is resolved');
    assert.equal(this.$('#promise2').text().trim(), '', 're-renders when the first promise is resolved');
    deferred2.resolve('promise2 resolved');

    return afterRender(promise2);
  }).then(() => {
    assert.equal(this.$('#promise1').text().trim(), 'promise1 resolved', 're-renders when the first promise is resolved');
    assert.equal(this.$('#promise2').text().trim(), 'promise2 resolved', 're-renders when the first promise is resolved');
  });
});

test('works with is-fulfilled helper', function (assert) {
  this.render(hbs`
    {{#with (promise-hash promise1=promise1 promise2=promise2) as |promiseAll|}}
      {{#if (is-fulfilled promiseAll)}}
        {{is-fulfilled promiseAll}}
      {{else}}
        idk if it's fulfilled
      {{/if}}
    {{/with}}
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
    {{#if (is-pending (promise-hash promise1=promise1 promise2=promise2))}}
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
    {{#with (promise-hash promise1=promise1 promise2=promise2) as |promiseAll|}}
      {{#if (is-rejected promiseAll)}}
        {{is-rejected promiseAll}}
      {{else}}
        idk if it's rejected
      {{/if}}
    {{/with}}
  `);

  assert.equal(this.$().text().trim(), `idk if it's rejected`, 'evaluates to false');

  deferred1.reject(new Error('nope'));

  return afterRender(RSVP.all([promise1, promise2])).then(() => {
    assert.equal(this.$().text().trim(), 'true', 'value changes and template re-renders');
  });
});

test('works with promise-rejected-reason helper', function (assert) {
  this.render(hbs`
    {{#with (promise-hash promise1=promise1 promise2=promise2) as |promiseAll|}}
      {{#if (promise-rejected-reason promiseAll)}}
        {{#with (promise-rejected-reason promiseAll) as |reason|}}
          {{reason.message}}
        {{/with}}
      {{else}}
        Probably not rejected yet.
      {{/if}}
    {{/with}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false until rejection is known');

  deferred1.reject(new Error('nope'));

  return afterRender(RSVP.all([promise1, promise2])).then((reason) => {
    assert.equal(this.$().text().trim(), 'nope', 'false until rejection is known');
  });
});
