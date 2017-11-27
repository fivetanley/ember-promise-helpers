/*jshint node:true*/
module.exports = {
  useYarn: true,
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'beta'
      },
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'canary'
      }
    }
  ]
};
