import AwaitHelper from './await';

export default class extends AwaitHelper {
  compute(params) {
    const maybePromise = params[0];
    return this.ensureLatestPromise(maybePromise, async (promise) => {
      try {
        await promise;
        this.setValue(null, maybePromise);
      } catch (reason) {
        this.setValue(reason, maybePromise);
      }
    });
  }
}
