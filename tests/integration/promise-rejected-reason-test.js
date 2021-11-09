import { hbs } from 'ember-cli-htmlbars';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';

module('integration - promise-rejected-reason error', function (hooks) {
  setupRenderingTest(hooks);

  test('is false until the promise rejects', async function (assert) {
    let deferred = RSVP.defer();
    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (promise-rejected-reason this.promise)}}
        {{#with (promise-rejected-reason this.promise) as |reason|}}
          {{reason.message}}
        {{/with}}
      {{else}}
        Probably not rejected yet.
      {{/if}}
    `);

    assert
      .dom(this.element)
      .hasText('Probably not rejected yet.', 'false until rejection is known');

    deferred.reject(new Error('nope'));

    return afterRender(deferred.promise).then(() => {
      assert
        .dom(this.element)
        .hasText('nope', 'false until rejection is known');
    });
  });

  test('is false when the promise resolves', async function (assert) {
    let deferred = RSVP.defer();
    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (promise-rejected-reason this.promise)}}
        {{#with (promise-rejected-reason this.promise) as |reason|}}
          {{reason.message}}
        {{/with}}
      {{else}}
        Probably not rejected yet.
      {{/if}}
    `);

    assert
      .dom(this.element)
      .hasText('Probably not rejected yet.', 'false before promise resolves');

    deferred.resolve(true);

    return afterRender(deferred.promise).then(() => {
      assert
        .dom(this.element)
        .hasText('Probably not rejected yet.', 'false after promise resolves');
    });
  });
});
