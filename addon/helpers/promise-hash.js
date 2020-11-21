import Helper from '@ember/component/helper';
import RSVP from 'rsvp';

export default Helper.extend({
  compute(params, hash) {
    return RSVP.hash(hash);
  },
});
