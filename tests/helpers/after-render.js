import { next, scheduleOnce } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';

export default function afterRender(promise) {
  return promise
    .catch(() => {})
    .finally(() => {
      return new EmberPromise(function (resolve) {
        next(scheduleOnce, 'afterRender', resolve);
      });
    });
}
