import { hbs } from 'ember-cli-htmlbars';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';
let deferred1, deferred2;
let promise1, promise2;

module('integration - promise-all helper', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    deferred1 = RSVP.defer();
    deferred2 = RSVP.defer();
    promise1 = deferred1.promise;
    promise2 = deferred2.promise;

    this.set('promise1', promise1);
    this.set('promise2', promise2);
  });

  test('works with iawait helper', async function(assert) {
    await render(hbs`
      <span id="promise">{{await (promise-all promise1 promise2)}}</span>
    `);

    assert.dom('#promise').exists({ count: 1 });
    assert.dom('#promise').hasText('');

    const text = 'yass!';

    deferred1.resolve(text);

    return afterRender(promise1).then(() => {
      assert.dom('#promise').hasText('', 're-renders when the first promise is resolved');
      deferred2.resolve(text);

      return afterRender(promise2);
    }).then(() => {
      // Promise.all() returns an array, Array.toString will be rendered as text ('yass!,yass!').
      assert.dom('#promise').hasText(`${text},${text}`, 're-renders when the second promise is resolved');
    });
  });

  test('works with is-fulfilled helper', async function(assert) {
    await render(hbs`
      {{#if (is-fulfilled (promise-all promise1 promise2))}}
        {{is-fulfilled (promise-all promise1 promise2)}}
      {{else}}
        idk if it's fulfilled
      {{/if}}
    `);

    assert.dom('*').hasText(`idk if it's fulfilled`, 'evaluates to false');

    deferred1.resolve('yay!');

    return afterRender(promise1).then(() => {
      assert.dom('*').hasText(`idk if it's fulfilled`, 'evaluates to false');
      deferred2.resolve('yay!');

      return afterRender(promise2);
    }).then(() => {
      assert.dom('*').hasText('true', 'value changes and template re-renders');
    });
  });


  test('works with is-pending helper', async function(assert) {
    await render(hbs`
      {{#if (is-pending (promise-all promise1 promise2))}}
        Pending!
      {{else}}
        Done!
      {{/if}}
    `);

    assert.dom('*').hasText('Pending!', 'is-pending is true before resolved');

    deferred1.resolve('resolved!');

    return afterRender(promise1).then(() => {
      assert.dom('*').hasText('Pending!', 'is-pending is true before resolved');
      deferred2.resolve('resolved!');

      return afterRender(promise2);
    }).then(() => {
      assert.dom('*').hasText('Done!', 'is-pending is false after resolved');
    });
  });

  test('works with is-rejected helper', async function(assert) {
    await render(hbs`
      {{#if (is-rejected (promise-all promise1 promise2))}}
        {{is-rejected (promise-all promise1 promise2)}}
      {{else}}
        idk if it's rejected
      {{/if}}
    `);

    assert.dom('*').hasText(`idk if it's rejected`, 'evaluates to false');

    deferred1.reject(new Error('nope'));

    return afterRender(RSVP.all([promise1, promise2])).then(() => {
      assert.dom('*').hasText('true', 'value changes and template re-renders');
    });
  });

  test('works with promise-rejected-reason helper', async function(assert) {
    await render(hbs`
      {{#if (promise-rejected-reason (promise-all promise1 promise2))}}
        {{#with (promise-rejected-reason (promise-all promise1 promise2)) as |reason|}}
          {{reason.message}}
        {{/with}}
      {{else}}
        Probably not rejected yet.
      {{/if}}
    `);

    assert.dom('*').hasText('Probably not rejected yet.', 'false until rejection is known');

    deferred1.reject(new Error('nope'));

    return afterRender(RSVP.all([promise1, promise2])).then(() => {
      assert.dom('*').hasText('nope', 'false until rejection is known');
    });
  });
});
