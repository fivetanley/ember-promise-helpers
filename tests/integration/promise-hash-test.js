import { hbs } from 'ember-cli-htmlbars';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';
let deferred1, deferred2;
let promise1, promise2;

module('integration - promise-hash helper', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    deferred1 = RSVP.defer();
    deferred2 = RSVP.defer();
    promise1 = deferred1.promise;
    promise2 = deferred2.promise;

    this.set('promise1', promise1);
    this.set('promise2', promise2);
  });

  test('works with await helper', async function (assert) {
    await render(hbs`
      {{#with (await (promise-hash promise1=this.promise1 promise2=this.promise2)) as |promiseAll|}}
        <span id="promise1">{{promiseAll.promise1}}</span>
        <span id="promise2">{{promiseAll.promise2}}</span>
      {{/with}}
    `);

    assert.dom('#promise1').doesNotExist();
    assert.dom('#promise2').doesNotExist();

    deferred1.resolve('promise1 resolved');

    return afterRender(promise1)
      .then(() => {
        assert.dom('#promise1').doesNotExist();
        assert.dom('#promise2').doesNotExist();
        deferred2.resolve('promise2 resolved');

        return afterRender(promise2);
      })
      .then(() => {
        assert
          .dom('#promise1')
          .hasText(
            'promise1 resolved',
            're-renders when the first promise is resolved'
          );
        assert
          .dom('#promise2')
          .hasText(
            'promise2 resolved',
            're-renders when the first promise is resolved'
          );
      });
  });

  test('works with is-fulfilled helper', async function (assert) {
    await render(hbs`
      {{#with (promise-hash promise1=this.promise1 promise2=this.promise2) as |promiseAll|}}
        {{#if (is-fulfilled promiseAll)}}
          {{is-fulfilled promiseAll}}
        {{else}}
          idk if it's fulfilled
        {{/if}}
      {{/with}}
    `);

    assert
      .dom(this.element)
      .hasText(`idk if it's fulfilled`, 'evaluates to false');

    deferred1.resolve('yay!');

    return afterRender(promise1)
      .then(() => {
        assert
          .dom(this.element)
          .hasText(`idk if it's fulfilled`, 'evaluates to false');
        deferred2.resolve('yay!');

        return afterRender(promise2);
      })
      .then(() => {
        assert
          .dom(this.element)
          .hasText('true', 'value changes and template re-renders');
      });
  });

  test('works with is-pending helper', async function (assert) {
    await render(hbs`
      {{#if (is-pending (promise-hash promise1=this.promise1 promise2=this.promise2))}}
        Pending!
      {{else}}
        Done!
      {{/if}}
    `);

    assert
      .dom(this.element)
      .hasText('Pending!', 'is-pending is true before resolved');

    deferred1.resolve('resolved!');

    return afterRender(promise1)
      .then(() => {
        assert
          .dom(this.element)
          .hasText('Pending!', 'is-pending is true before resolved');
        deferred2.resolve('resolved!');

        return afterRender(promise2);
      })
      .then(() => {
        assert
          .dom(this.element)
          .hasText('Done!', 'is-pending is false after resolved');
      });
  });

  test('works with is-rejected helper', async function (assert) {
    await render(hbs`
      {{#with (promise-hash promise1=this.promise1 promise2=this.promise2) as |promiseAll|}}
        {{#if (is-rejected promiseAll)}}
          {{is-rejected promiseAll}}
        {{else}}
          idk if it's rejected
        {{/if}}
      {{/with}}
    `);

    assert
      .dom(this.element)
      .hasText(`idk if it's rejected`, 'evaluates to false');

    deferred1.reject(new Error('nope'));

    return afterRender(RSVP.all([promise1, promise2])).then(() => {
      assert
        .dom(this.element)
        .hasText('true', 'value changes and template re-renders');
    });
  });

  test('works with promise-rejected-reason helper', async function (assert) {
    await render(hbs`
      {{#with (promise-hash promise1=this.promise1 promise2=this.promise2) as |promiseAll|}}
        {{#if (promise-rejected-reason promiseAll)}}
          {{#with (promise-rejected-reason promiseAll) as |reason|}}
            {{reason.message}}
          {{/with}}
        {{else}}
          Probably not rejected yet.
        {{/if}}
      {{/with}}
    `);

    assert
      .dom(this.element)
      .hasText('Probably not rejected yet.', 'false until rejection is known');

    deferred1.reject(new Error('nope'));

    return afterRender(RSVP.all([promise1, promise2])).then(() => {
      assert
        .dom(this.element)
        .hasText('nope', 'false until rejection is known');
    });
  });
});
