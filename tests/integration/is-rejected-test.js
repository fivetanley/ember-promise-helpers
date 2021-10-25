import { hbs } from 'ember-cli-htmlbars';
import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';

module('integration - is-rejected helper', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {});

  test('evaluates to false until the promise is resolved', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-rejected this.promise)}}
        {{is-rejected this.promise}}
      {{else}}
        idk if it's rejected
      {{/if}}
    `);

    assert.dom('*').hasText(`idk if it's rejected`, 'evaluates to false');

    deferred.reject(new Error('noooo :('));

    return afterRender(deferred.promise).then(() => {
      assert.dom('*').hasText('true', 'value changes and template re-renders');
    });
  });

  test('renders false when given already fulfilled promise', async function (assert) {
    let deferred = RSVP.defer();

    deferred.resolve('omg!');

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-rejected this.promise)}}
        {{is-rejected this.promise}}
      {{else}}
        promise is already fulfilled
      {{/if}}
    `);

    return afterRender(deferred.promise).then(() => {
      assert.dom('*').hasText('promise is already fulfilled');
    });
  });

  test('evaluates to true given an already rejected promise', function (assert) {
    // rejecting because ember fails the test immediately for some reason
    // when rejecting immediately... sigh
    let promise = new RSVP.Promise((_, reject) => {
      later(() => {
        reject(new Error('nooooo :('));
      }, 100);
    });

    return promise
      .catch(() => {})
      .then(async () => {
        this.set('promise', promise);

        await render(hbs`
        {{#if (is-rejected this.promise)}}
          {{is-rejected this.promise}}
        {{else}}
          totally rejected
        {{/if}}
      `);

        return afterRender(promise);
      })
      .then(() => {
        assert.dom('*').hasText('true');
      });
  });

  test('always renders with the last promise set', async function (assert) {
    let deferred1 = RSVP.defer();
    let deferred2 = RSVP.defer();
    let deferred3 = RSVP.defer();

    this.set('promise', deferred1.promise);

    await render(hbs`
      {{if (is-rejected this.promise) 'rejected' 'not-rejected'}}
    `);

    deferred1.resolve('number 1');

    later(deferred2, 'resolve', 'number 2', 200);
    later(deferred3, 'reject', new Error('hi'), 300);

    this.set('promise', deferred2.promise);
    this.set('promise', deferred3.promise);

    const promises = [deferred1, deferred2, deferred3].map((d) => d.promise);

    return afterRender(RSVP.all(promises)).finally(() => {
      assert
        .dom('*')
        .hasText(
          'rejected',
          'the last set promise is rendered last even when other promises resolve first'
        );
    });
  });
});
