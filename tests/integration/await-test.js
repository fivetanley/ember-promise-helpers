import { test, moduleForComponent } from 'ember-qunit';
import afterRender from 'dummy/tests/helpers/after-render';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - await helper', {
  integration: true,

  beforeEach() {

  }
});

test('renders null until the promise is resolved', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <span id="promise">{{await promise}}</span>
  `);

  assert.equal(this.$('#promise').length, 1);
  assert.equal(this.$('#promise').text().trim(), '');

  const text = 'yass!';

  deferred.resolve(text);

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#promise').text().trim(), text, 're-renders when the promise is resolved');
  });
});

test('renders null until the promise is rejected', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <span id="promise">{{await promise}}</span>
  `);

  assert.equal(this.$('#promise').text().trim(), '');

  deferred.reject(new Error('oops'));

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#promise').text().trim(), '', 'value of re-render does not reveal reason for rejection');
  });
});

test('changing the promise changes the eventually rendered value', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();

  this.set('promise', deferred1.promise);

  this.render(hbs`
    <span id="promise">{{await promise}}</span>
  `);

  const deferred1Text = 'hi';
  const deferred2Text = 'bye';

  deferred1.resolve(deferred1Text);

  return afterRender(deferred1.promise).then(() => {
    deferred2.resolve(deferred2Text);
    this.set('promise', deferred2.promise);
    return afterRender(deferred2.promise);
  }).then(() => {
    assert.equal(this.$('#promise').text().trim(), deferred2Text, 'value updates when the promise changes');
  });
});

test('works with {{#each}} when promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <ul>
      {{#each (await promise) as |thing|}}
        <li>{{thing.name}}</li>
      {{else}}
        Nothing.
      {{/each}}
    </ul>
  `);

  assert.equal(this.$().text().trim(), 'Nothing.', '{{#each}} renders as empty until promise resolves');

  deferred.resolve([
    {name: 'Katie'},
    {name: 'Jenny'},
    {name: 'Anna'}
  ]);

  return afterRender(deferred.promise).then(() => {
    let lis = this.$('li');
    assert.equal(lis.length, 3);

    let text = lis.map((i, el) => {
      return Ember.$(el).text().trim();
    }).toArray();

    assert.equal(text.join(' '), 'Katie Jenny Anna');
  });
});

test('works with {{#each}} when promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <ul>
      {{#each (await promise) as |thing|}}
        <li>{{thing.name}}</li>
      {{else}}
        Nothing.
      {{/each}}
    </ul>
  `);

  assert.equal(this.$().text().trim(), 'Nothing.', '{{#each}} renders as empty until promise rejects');

  deferred.reject(new Error('oh no'));

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('li').length, 0);
  });
});

test('works with inline if when promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <div class="foo {{if (await promise) 'fullfilled' 'rejected'}}"></div>
  `);

  assert.equal(this.$('.foo').hasClass('fulfilled'), false);

  deferred.reject(new Error('oh no'));

  return deferred.promise.catch(() => {
    assert.equal(this.$('.foo').hasClass('fulfilled'), false);
  });
});

test('works with inline if when promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <div id="foo" class="{{if (await promise) 'fulfilled' 'rejected'}}"></div>
  `);

  assert.equal(this.$('#foo').hasClass('fulfilled'), false);

  deferred.resolve('yay!');

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#foo').hasClass('fulfilled'), true, 'inline if updates with when promise resolves');
    deferred.resolve();
  });
});

test('always renders with the last promise set', function (assert) {
  let deferred1 = RSVP.defer();
  let deferred2 = RSVP.defer();
  let deferred3 = RSVP.defer();

  this.set('promise', deferred3);

  this.render(hbs`
    {{await promise}}
  `);

  deferred1.resolve('number 1');

  Ember.run.later(deferred2, 'resolve', 'number 2', 200);
  Ember.run.later(deferred3, 'resolve', 'number 3', 500);

  this.set('promise', deferred2.promise);
  this.set('promise', deferred3.promise);

  return afterRender(RSVP.all([deferred2.promise, deferred3.promise])).then(() => {
    assert.equal(this.$().text().trim(), 'number 3', 'the last set promise is rendered last even when other promises resolve first');
  });

});


test('passes through non-promise values unchanged', function (assert) {
  this.set('value', 42);

  this.render(hbs`
    <span id="promise">{{await value}}</span>
  `);

  assert.equal(this.$('#promise').length, 1);
  assert.equal(this.$('#promise').text().trim(), '42');

});

test('switching from promise to non-promise correctly ignores promise resolution', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <span id="promise">{{await promise}}</span>
  `);

  this.set('promise', 'iAmConstant');
  assert.equal(this.$('#promise').text().trim(), 'iAmConstant');
  deferred.resolve('promiseFinished');

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#promise').text().trim(), 'iAmConstant', 'ignores a promise that has been replaced');
  });
});

test('promises that get wrapped by RSVP.Promise.resolve still work correctly', function(assert) {
  let deferred = RSVP.defer();
  let ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);
  let proxy = ObjectPromiseProxy.create({
    promise: deferred.promise
  });
  this.set('promise', proxy);
  this.render(hbs`
    {{#with (await promise) as |obj|}}
      <span id="promise">{{obj.foo}}</span>
    {{/with}}
  `);
  deferred.resolve({ foo: 'hasAValue' });
  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#promise').text().trim(), 'hasAValue');
  });
});

test('works with block-if when promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', deferred.promise);

  this.render(hbs`
    <span id="promise">
      {{#if (await promise)}}
        {{promise.text}}
      {{else}}
        Nope!
      {{/if}}
    </span>
  `);

  assert.equal(this.$('#promise').length, 1);
  assert.equal(this.$('#promise').text().trim(), 'Nope!');

  const result = {
    text: 'yass!'
  };

  deferred.resolve(result);

  return afterRender(deferred.promise).then(() => {
    assert.equal(this.$('#promise').text().trim(), result.text, 're-renders when the promise is resolved');
  });
});
