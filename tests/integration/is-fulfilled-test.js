import { hbs } from 'ember-cli-htmlbars';
import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';

module('integration - is-fulfilled helper', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {});

  test('evaluates to false until the promise is resolved', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-fulfilled this.promise)}}
        {{is-fulfilled this.promise}}
      {{else}}
        idk if it's fulfilled
      {{/if}}
    `);

    assert
      .dom(this.element)
      .hasText(`idk if it's fulfilled`, 'evaluates to false');

    deferred.resolve('yay!');

    return afterRender(deferred.promise).then(() => {
      assert
        .dom(this.element)
        .hasText('true', 'value changes and template re-renders');
    });
  });

  test('renders true when given already fulfilled promise', async function (assert) {
    let deferred = RSVP.defer();

    deferred.resolve('omg!');

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-fulfilled this.promise)}}
        {{is-fulfilled this.promise}}
      {{else}}
        idk if it's fulfilled
      {{/if}}
    `);

    return afterRender(deferred.promise).then(() => {
      assert.dom(this.element).hasText('true');
    });
  });

  test('evaluates to falsy given already rejected promise', function (assert) {
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
        {{#if (is-fulfilled this.promise)}}
          {{is-fulfilled this.promise}}
        {{else}}
          totally rejected
        {{/if}}
      `);
        return afterRender(promise);
      })
      .then(() => {
        assert.dom(this.element).hasText('totally rejected');
      });
  });

  test('always renders with the last promise set', async function (assert) {
    let deferred1 = RSVP.defer();
    let deferred2 = RSVP.defer();
    let deferred3 = RSVP.defer();

    this.set('promise', deferred1);

    await render(hbs`
      {{if (is-fulfilled this.promise) 'fulfilled' 'rejected'}}
    `);

    deferred1.resolve('number 1');

    later(deferred2, 'resolve', 'number 2', 200);
    later(deferred3, 'reject', new Error('nope'));

    this.set('promise', deferred2.promise);
    this.set('promise', deferred3.promise);

    const allPromises = [deferred1, deferred2, deferred3].map((d) => d.promise);

    return afterRender(RSVP.all(allPromises)).finally(() => {
      assert
        .dom(this.element)
        .hasText(
          'rejected',
          'the last set promise is rendered last even when other promises resolve first'
        );
    });
  });
});
