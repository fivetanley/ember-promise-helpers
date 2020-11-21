import Helper from '@ember/component/helper';
import RSVP from 'rsvp';

export default class extends Helper {
  compute(params) {
    const args = Array.isArray(params[0]) ? params[0] : params;

    return RSVP.all(args);
  }
}
