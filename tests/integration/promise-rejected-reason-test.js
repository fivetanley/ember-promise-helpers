import { moduleForComponent } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const {RSVP} = Ember;

moduleForComponent('integration - promise-rejected-reason error', {
  integration: true
});

skip('is false until the promise rejects', function (assert) {
  let deferred = RSVP.defer();
  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (promise-rejected-reason promise)}}
      {{get (promise-rejected-reason promise) 'message'}}
    {{else}}
      Probably not rejected yet.
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false until rejection is known');

  deferred.reject(new Error('nope'));

  return deferred.promise.catch((reason) => {
    assert.equal(this.$().text().trim(), reason.message, 'false until rejection is known');
  });
});

skip('is false when the promise resolves', function (assert) {
  let deferred = RSVP.defer();
  this.set('promise', deferred.promise);

  this.render(hbs`
    {{#if (promise-rejected-reason promise)}}
      {{get (promise-rejected-reason promise) 'message'}}
    {{else}}
      Probably not rejected yet.
    {{/if}}
  `);

  assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false before promise resolves');

  deferred.reject(new Error('nope'));

  return deferred.promise.then(() => {
    assert.equal(this.$().text().trim(), 'Probably not rejected yet.', 'false after promise resolves');
  });
});
