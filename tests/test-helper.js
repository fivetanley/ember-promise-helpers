import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import TestLoader from 'ember-cli-test-loader/test-support';


setResolver(resolver);
TestLoader.load();
