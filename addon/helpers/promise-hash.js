import Helper from '@ember/component/helper';
import RSVP from 'rsvp';

export default class extends Helper {
  compute(params, hash) {
    return RSVP.hash(hash);
  }
}
