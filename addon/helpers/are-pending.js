import Ember from 'ember';
import IsPendingHelper from 'ember-promise-helpers/helpers/is-pending';

const {RSVP} = Ember;

export default IsPendingHelper.extend({
  compute(params, hash) {
    const args = Array.isArray(params[0]) ? params[0] : params;
    const maybePromises = RSVP.all(args);

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
