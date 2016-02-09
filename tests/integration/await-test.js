import { test, moduleForComponent } from 'ember-qunit';
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

  return deferred.promise.then(() => {
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

  return deferred.promise.then(() => {
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

  return deferred1.promise.then(() => {
    deferred2.resolve(deferred2Text);
    return deferred2.promise;
  }).then(() => {
    assert.equal(this.$('#promise').text().trim(), deferred2Text, 'value updates when the promise changes');
  });
});

test('works with {{#each}} when promise resolves', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', promise.deferred);

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

  return deferred.promise.then(() => {
    let lis = this.$('li');
    assert.equal(lis.length, 3);

    let text = lis.map(function() {
      return this.$().text().trim();
    });

    assert.equal(text.join(' '), 'Katie Jenny Anna');
  });
});

test('works with {{#each}} when promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', promise.deferred);

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

  return deferred.promise.catch(() => {
    assert.equal(this.$('li').length, 0);
  });
});

test('works with inline if when promise rejects', function (assert) {
  let deferred = RSVP.defer();

  this.set('promise', promise.deferred);

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

  this.set('promise', promise.deferred);

  this.render(hbs`
    <div class="foo {{if (await promise) 'fullfilled' 'rejected'}}"></div>
  `);

  assert.equal(this.$('.foo').hasClass('fulfilled'), false);

  deferred.resolve('yay!');

  return deferred.promise.then(() => {
    assert.equal(this.$('.foo').hasClass('fulfilled'), true, 'inline if updates with when promise resolves');
  });
});

