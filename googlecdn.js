'use strict';

var async = require('async');
var semver = require('semver');
var debug = require('debug')('google-cdn');
var requote = require('regexp-quote');
var escape = require('escape-regexp');

var data = {
  google: require('google-cdn-data'),
  cdnjs: require('cdnjs-cdn-data')
};

var bowerUtil = require('./util/bower');

function normalizeBowerName(bowerJson, name) {
  if ((bowerJson.dependencies && bowerJson.dependencies[name]) ||
      (bowerJson.devDependencies && bowerJson.devDependencies[name])) {
    return name;
  } else {
    return name.replace(/\.js$/,'');
  }
}

function getDepVersionStr(deps, name, cleanup) {
  if (deps) {
    var versionStr = deps[name];
    if (versionStr && cleanup) {
      delete deps[name];
    }
    return versionStr;
  }
}

function getVersionStr(bowerJson, name, cleanup) {
  var versionStr;
  var bowerName = normalizeBowerName(bowerJson, name);

  versionStr = getDepVersionStr(bowerJson.dependencies, bowerName, cleanup);

  if (!versionStr) {
    versionStr = getDepVersionStr(bowerJson.devDependencies, bowerName, cleanup);
  }

  return versionStr;
}

function satisfyDependency(bowerJson, name) {
  getVersionStr(bowerJson, name, true);
}


function isFunction(fn) {
  return typeof(fn) === 'function';
}

function getCDNUrl(item, type, version) {
  var url = item[type] || item.url;
  if (url) {
    return (isFunction(url)) ? url(version) : url;
  }
}

function getTypesArray(types) {
  if (Array.isArray(types) || typeof(types) === 'string') {
    return [].concat(types);
  } else if (types) {
    throw new Error('Types must be an array or a string');
  }
}


module.exports = function cdnify(content, bowerJsonOriginal, options, masterCallback) {

  if (!bowerJsonOriginal) {
    throw new Error('Required argument `bowerJson` is missing.');
  }
  //clone bowerJson so that it can be modified
  var bowerJson = JSON.parse(JSON.stringify(bowerJsonOriginal));

  if (isFunction(options)) {
    masterCallback = options;
    options = {};
  }

  options = options || {};
  options.componentsPath = options.componentsPath || 'bower_components';

  var cdn = options.cdn || 'google';
  var cdnData = {};
  if (Array.isArray(cdn)) {
    cdn.forEach(function(host) {
      cdnData[host] = data[host];
    });
  } else if (typeof(cdn) === 'object') {
    cdnData.custom = cdn;
  } else {
    cdnData[cdn] = data[cdn];
  }

  var supportedTypes = {};
  supportedTypes.types = getTypesArray(options.types) || ['js', 'css'];
  supportedTypes.typesRegex = {};
  supportedTypes.types.forEach(function (type) {
    supportedTypes.typesRegex[type] = new RegExp('\\.' + escape(type) + '$', 'i');
  });

  var cdnHostList = Object.keys(cdnData);

  if (!cdnHostList.length) {
    return masterCallback(new Error('CDN ' + cdn + ' is not supported.'));
  }
  for (var i = 0; i < cdnHostList.length; i++) {
    var badCdn = cdnHostList[i];
    if (!cdnData[badCdn]) {
      return masterCallback(new Error('CDN ' + badCdn + ' is not supported.'));
    }
  }

  function generateReplacement(bowerPath, url) {
    // Replace leading slashes if present.
    var from = bowerUtil.joinComponent(options.componentsPath, bowerPath);
    var fromRe = '/?' + requote(from);
    var fromRegex = new RegExp(fromRe);
    return {
      from: from,
      fromRegex: fromRegex,
      to: url
    };
  }

  function buildReplacement(cdnHost) {
    return function(name, callback) {
      var item = cdnData[cdnHost][name];
      var versionStr = getVersionStr(bowerJson, name);

      if (!versionStr) {
        return callback();
      }
      name = normalizeBowerName(bowerJson, name);

      var version = semver.maxSatisfying(item.versions, versionStr);
      if (version) {
        satisfyDependency(bowerJson, name);
        debug('Choosing version %s for dependency %s', version, name);

        if (item.all) {
          var url = (isFunction(item.url)) ? item.url(version) : item.url;
          callback(null, generateReplacement(name, url));
        } else {
          bowerUtil.resolveMainPath(supportedTypes, name, versionStr, function (err, main) {
            if (err) {
              return callback(err);
            } else {
              var replacements = [];
              for (var type in main) {
                var url = getCDNUrl(item, type, version);
                if (url) {
                  replacements.push(generateReplacement(main[type], url));
                }
              }
              callback(null, replacements);

            }
          });
        }
      } else {
        debug('Could not find satisfying version for %s %s', name, versionStr);
        callback();
      }
    };
  }

  var replacementInfo = [];

  function buildReplacementForHost(cdnHost, callback) {
    async.map(Object.keys(cdnData[cdnHost]), buildReplacement(cdnHost), function (err, replacements) {
      if (err) {
        return callback(err);
      }

      function replaceContent(fileReplacement) {
        if (fileReplacement) {
          content = content.replace(fileReplacement.fromRegex, fileReplacement.to);
          debug('Replaced %s with %s', fileReplacement.fromRegex, fileReplacement.to);
          replacementInfo.push(fileReplacement);
        }
      }

      replacements.forEach(function (replacement) {
        if (replacement) {
          if (Array.isArray(replacement)) {
            replacement.forEach(replaceContent);
          } else {
            replaceContent(replacement);
          }
        }
      });
      callback();
    });
  }

  async.eachSeries(cdnHostList, buildReplacementForHost, function(err) {
    if (err) {
      return masterCallback(err);
    }

    masterCallback(null, content, replacementInfo);
  });
};
