import AwaitHelper from 'ember-promise-helpers/helpers/await';

export default AwaitHelper.extend({
  compute(params) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, (promise) => {
      promise.then(() => {
        this.setValue(true, maybePromise);
      }).catch(() => {
        this.setValue(false, maybePromise);
      });
    });
  }
});
