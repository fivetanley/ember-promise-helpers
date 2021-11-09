import { hbs } from 'ember-cli-htmlbars';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import ObjectProxy from '@ember/object/proxy';
import { later } from '@ember/runloop';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import afterRender from 'dummy/tests/helpers/after-render';

module('integration - await helper', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {});

  test('renders null until the promise is resolved', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <span id="promise">{{await this.promise}}</span>
    `);

    assert.dom('#promise').exists({ count: 1 });
    assert.dom('#promise').hasText('');

    const text = 'yass!';

    deferred.resolve(text);

    return afterRender(deferred.promise).then(() => {
      assert
        .dom('#promise')
        .hasText(text, 're-renders when the promise is resolved');
    });
  });

  test('renders null until the promise is rejected', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <span id="promise">{{await this.promise}}</span>
    `);

    assert.dom('#promise').hasText('');

    deferred.reject(new Error('oops'));

    return afterRender(deferred.promise).then(() => {
      assert
        .dom('#promise')
        .hasText('', 'value of re-render does not reveal reason for rejection');
    });
  });

  test('changing the promise changes the eventually rendered value', async function (assert) {
    let deferred1 = RSVP.defer();
    let deferred2 = RSVP.defer();

    this.set('promise', deferred1.promise);

    await render(hbs`
      <span id="promise">{{await this.promise}}</span>
    `);

    const deferred1Text = 'hi';
    const deferred2Text = 'bye';

    deferred1.resolve(deferred1Text);

    return afterRender(deferred1.promise)
      .then(() => {
        deferred2.resolve(deferred2Text);
        this.set('promise', deferred2.promise);
        return afterRender(deferred2.promise);
      })
      .then(() => {
        assert
          .dom('#promise')
          .hasText(deferred2Text, 'value updates when the promise changes');
      });
  });

  test('works with {{#each}} when promise resolves', async function (assert) {
    assert.expect(3);
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <ul>
        {{#each (await this.promise) as |thing|}}
          <li>{{thing.name}}</li>
        {{else}}
          Nothing.
        {{/each}}
      </ul>
    `);

    assert
      .dom(this.element)
      .hasText('Nothing.', '{{#each}} renders as empty until promise resolves');

    deferred.resolve([{ name: 'Katie' }, { name: 'Jenny' }, { name: 'Anna' }]);

    return afterRender(deferred.promise).then(() => {
      assert.dom('li').exists({ count: 3 });

      const names = findAll('li')
        .map((el) => el.textContent.trim())
        .join(' ');

      assert.equal(names, 'Katie Jenny Anna');
    });
  });

  test('works with {{#each}} when promise rejects', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <ul>
        {{#each (await this.promise) as |thing|}}
          <li>{{thing.name}}</li>
        {{else}}
          Nothing.
        {{/each}}
      </ul>
    `);

    assert
      .dom(this.element)
      .hasText('Nothing.', '{{#each}} renders as empty until promise rejects');

    deferred.reject(new Error('oh no'));

    return afterRender(deferred.promise).then(() => {
      assert.dom('li').doesNotExist();
    });
  });

  test('works with inline if when promise rejects', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <div class="foo {{if (await this.promise) 'fullfilled' 'rejected'}}"></div>
    `);

    assert.dom('.foo').hasNoClass('fulfilled');

    deferred.reject(new Error('oh no'));

    return deferred.promise.catch(() => {
      assert.dom('.foo').hasNoClass('fulfilled');
    });
  });

  test('works with inline if when promise resolves', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <div id="foo" class="{{if (await this.promise) 'fulfilled' 'rejected'}}"></div>
    `);

    assert.dom('#foo').hasNoClass('fulfilled');

    deferred.resolve('yay!');

    return afterRender(deferred.promise).then(() => {
      assert
        .dom('#foo')
        .hasClass('fulfilled', 'inline if updates with when promise resolves');
      deferred.resolve();
    });
  });

  test('always renders with the last promise set', async function (assert) {
    let deferred1 = RSVP.defer();
    let deferred2 = RSVP.defer();
    let deferred3 = RSVP.defer();

    this.set('promise', deferred3);

    await render(hbs`
      {{await this.promise}}
    `);

    deferred1.resolve('number 1');

    later(deferred2, 'resolve', 'number 2', 200);
    later(deferred3, 'resolve', 'number 3', 500);

    this.set('promise', deferred2.promise);
    this.set('promise', deferred3.promise);

    return afterRender(RSVP.all([deferred2.promise, deferred3.promise])).then(
      () => {
        assert
          .dom(this.element)
          .hasText(
            'number 3',
            'the last set promise is rendered last even when other promises resolve first'
          );
      }
    );
  });

  test('passes through non-promise values unchanged', async function (assert) {
    this.set('value', 42);

    await render(hbs`
      <span id="promise">{{await this.value}}</span>
    `);

    assert.dom('#promise').exists({ count: 1 });
    assert.dom('#promise').hasText('42');
  });

  test('switching from promise to non-promise correctly ignores promise resolution', async function (assert) {
    let deferred = RSVP.defer();

    this.set('promise', deferred.promise);

    await render(hbs`
      <span id="promise">{{await this.promise}}</span>
    `);

    this.set('promise', 'iAmConstant');
    assert.dom('#promise').hasText('iAmConstant');
    deferred.resolve('promiseFinished');

    return afterRender(deferred.promise).then(() => {
      assert
        .dom('#promise')
        .hasText('iAmConstant', 'ignores a promise that has been replaced');
    });
  });

  test('promises that get wrapped by RSVP.Promise.resolve still work correctly', async function (assert) {
    let deferred = RSVP.defer();
    let ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);
    let proxy = ObjectPromiseProxy.create({
      promise: deferred.promise,
    });
    this.set('promise', proxy);
    await render(hbs`
      {{#with (await this.promise) as |obj|}}
        <span id="promise">{{obj.foo}}</span>
      {{/with}}
    `);
    deferred.resolve({ foo: 'hasAValue' });
    return afterRender(deferred.promise).then(() => {
      assert.dom('#promise').hasText('hasAValue');
    });
  });
});
