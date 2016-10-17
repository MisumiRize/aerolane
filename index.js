'use strict';

require('babel-polyfill');

module.exports = {
  init: require('./lib/init'),
  serve: require('./lib/serve'),
  publish: require('./lib/publish'),
  platforms: {
    gradle: require('./lib/gradle'),
    carthage: require('./lib/carthage')
  }
};
