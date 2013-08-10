'use strict';

var semver = require('semver');
var debug = require('debug')('google-cdn');

var data = require('./lib/data');
var bowerUtil = require('./util/bower');
var hoist = require('./util/hoist');

var CDN_AJAX_PATH = '//ajax.googleapis.com/ajax/libs/';


function getVersionStr(bowerJson, name) {
  var versionStr;
  if (bowerJson.dependencies) {
    versionStr = bowerJson.dependencies[name];
  }

  if (!versionStr && bowerJson.devDependencies && bowerJson.devDependencies[name]) {
    versionStr = bowerJson.devDependencies[name];
  }

  return versionStr;
}


module.exports = function cdnify(content, bowerJson, options) {
  options = options || {};
  options.componentsPath = options.componentsPath || 'bower_components';

  var cdn = options.cdn || 'google';
  var cdnData = data[cdn];

  if (!cdnData) {
    console.warn('CDN ' + cdn + ' is not supported. Skipping');
    return content;
  }

  Object.keys(cdnData).forEach(function (name) {
    var item = cdnData[name];
    var versionStr = getVersionStr(bowerJson, name);

    if (!versionStr) {
      return;
    }

    var version = semver.maxSatisfying(item.versions, versionStr);
    if (version) {
      debug('Choosing version %s for dependency %s', version, name);

      var from = bowerUtil.joinComponent(options.componentsPath, item.main);
      var to = (typeof item.url === 'function') ? item.url(version) : item.url;
      content = content.replace(from, to);

      debug('Replaced %s with %s', from, to);
    } else {
      debug('Could not find satisfying version for %s %s', name, versionStr);
    }
  });

  var linesToMove = [];
  content.split('\n').forEach(function (line) {
    // TODO!
    if (line.indexOf(CDN_AJAX_PATH) !== -1) {
      linesToMove.push(line);
    }
  });

  try {
    content = hoist({
      body: content,
      marker: '<!-- build:js scripts/scripts.js -->',
      move: linesToMove
    });
  } catch (e) {
    debug('Hoisting failed: %s', e);
  }

  return content;
};
