import AwaitHelper from 'ember-promise-helpers/helpers/await';

export default AwaitHelper.extend({
  valueBeforeSettled: true,

  compute(params, hash) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, (promise) => {
      promise.catch(() => {}).finally(() => {
        this.setValue(false, maybePromise);
      });
    });
  }
});
