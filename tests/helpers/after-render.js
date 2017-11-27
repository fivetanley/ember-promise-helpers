import Ember from 'ember';

export default function afterRender(promise) {
  return promise.catch(() => {}).finally(() => {
    return new Ember.RSVP.Promise(function (resolve) {
      Ember.run.next(Ember.run.scheduleOnce, 'afterRender', resolve);
    });
  });
}
