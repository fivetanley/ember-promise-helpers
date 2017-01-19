import Ember from 'ember';
import IsPendingHelper from 'ember-promise-helpers/helpers/is-pending';

const {RSVP} = Ember;

/**
 * Symbols are not yet supported by Ember babel polyfill.
 * To compare Ember.RSVP promises must store the promises in a '_promises' property
 * to compare each promise individually.
 */
function compareRSVP(a, b) {
  if (a && a._promises && b && b._promises) {
    return a._promises.every((promise, index) => promise === b._promises[index]);
  }
  return false;
}

export default IsPendingHelper.extend({
  compute(params, hash) {
    const args = Array.isArray(params[0]) ? params[0] : params;
    const maybePromises = RSVP.all(args);

    maybePromises._promises = args;

    return this._super([maybePromises], hash);
  },

  ensureLatestPromise(promise, callback) {
    if (this._wasSettled && compareRSVP(promise, this._promise)) {
      return this._value;
    }

    return this._super(promise, callback);
  }
});
