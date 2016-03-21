import AwaitHelper from 'ember-promise-helpers/helpers/await';

export default AwaitHelper.extend({
  compute(params, hash) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, (promise) => {
      promise.then(() => {
        this.setValue(false, maybePromise);
      }).catch(() => {
        this.setValue(true, maybePromise);
      });
    });
  }
});
