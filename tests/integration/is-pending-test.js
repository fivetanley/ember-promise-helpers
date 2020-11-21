import { hbs } from 'ember-cli-htmlbars';
import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';

module('integration - is-pending helper', function(hooks) {
  setupRenderingTest(hooks);

  test('is true until the promise resolves', async function(assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-pending promise)}}
        Pending!
      {{else}}
        Done!
      {{/if}}
    `);

    assert.dom('*').hasText('Pending!', 'is-pending is true before resolved');

    deferred.resolve('resolved!');

    return afterRender(deferred.promise).then(() => {
      assert.dom('*').hasText('Done!', 'is-pending is false after resolved');
    });
  });

  test('is true until the promise rejects', async function(assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      {{#if (is-pending promise)}}
        Pending!
      {{else}}
        Done!
      {{/if}}
    `);

    assert.dom('*').hasText('Pending!', 'is-pending is false before resolved');

    deferred.reject(new Error('oh noes'));

    return afterRender(deferred.promise).then(() => {
      assert.dom('*').hasText('Done!', 'is-pending is true after resolved');
    });
  });

  test('always renders with the last promise set', async function(assert) {
    let deferred1 = RSVP.defer();
    let deferred2 = RSVP.defer();
    let deferred3 = RSVP.defer();

    this.set('promise', deferred1.promise);

    await render(hbs`
      {{if (is-pending promise) 'pending' 'not-pending'}}
    `);

    deferred1.resolve('number 1');

    later(deferred2, 'resolve', 'number 2', 200);
    // We don't resolve deferred3 so is-pending should be true

    this.set('promise', deferred2.promise);
    this.set('promise', deferred3.promise);

    const promises = [deferred1, deferred2].map(d => d.promise);

    return afterRender(RSVP.all(promises)).then(() => {
      assert.dom('*').hasText(
        'pending',
        'the last set promise is rendered last even when other promises resolve first'
      );
    });

  });
});

