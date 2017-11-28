import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Helper.extend({
  compute(params) {
    const args = Array.isArray(params[0]) ? params[0] : params;

    return RSVP.all(args);
  }
});
