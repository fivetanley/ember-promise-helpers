import Ember from 'ember';

export default function afterRender(promise) {
  return promise.catch(() => {}).finally(() => {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.run.scheduleOnce('afterRender', resolve);
    });
  });
}
