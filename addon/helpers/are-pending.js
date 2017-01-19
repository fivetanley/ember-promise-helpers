import Ember from 'ember';
import IsPendingHelper from 'ember-promise-helpers/helpers/is-pending';

const {RSVP} = Ember;

export default IsPendingHelper.extend({
  compute(params, hash) {
    const maybePromises = RSVP.all(params);

    return this._super([maybePromises], hash);
  },

  ensureLatestPromise(promise, callback) {
    const promiseSymbol = Symbol.for(promise);

    if (this._wasSettled && promiseSymbol === this._promiseSymbol) {
      return this._value;
    }

    this._promiseSymbol = promiseSymbol;

    return this._super(promise, callback);
  }
});
