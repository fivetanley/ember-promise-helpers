import Ember from 'ember';

const {RSVP} = Ember;
const {Promise} = RSVP;

export default Ember.Helper.extend({

  compute(params, hash) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, (promise) => {
      Promise.resolve(promise).then((value) => {
        this._value = value;
        this.settle();
      }).catch(() => {
        this.settle();
      });
    });
  },

  ensureLatestPromise(promise, callback) {
    if (this._wasSettled && promise === this._promise) {
      return this._value;
    } else {
      this.unsettle();
    }

    this._promise = promise;

    callback.call(this, Promise.resolve(this._promise));
    return null;
  },

  settle() {
    this._wasSettled = true;
    this.recompute();
  },

  unsettle() {
    this._wasSettled = false;
    this._promise = null;
    this.recompute();
  }
});
