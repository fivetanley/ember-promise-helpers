import AwaitHelper from 'ember-promise-helpers/helpers/await';

export default class extends AwaitHelper {
  compute(params) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, async (promise) => {
      try {
        await promise;
        this.setValue(true, maybePromise);
      } catch (_err) {
        this.setValue(false, maybePromise);
      }
    });
  }
}
