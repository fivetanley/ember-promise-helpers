import AwaitHelper from 'ember-promise-helpers/helpers/await';

export default class extends AwaitHelper {
  constructor(...args) {
    super(...args);
    this.valueBeforeSettled = true;
  }

  compute(params) {
    const maybePromise = params[0];

    return this.ensureLatestPromise(maybePromise, async (promise) => {
      try {
        await promise;
        /* eslint-disable-next-line no-empty */
      } catch (_err) {
      } finally {
        this.setValue(false, maybePromise);
      }
    });
  }
}
