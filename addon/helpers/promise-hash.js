import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Helper.extend({
  compute(params, hash) {
    return RSVP.hash(hash);
  }
});
