'use strict';

var os = require('os');
var async = require('async');
var semver = require('semver');
var debug = require('debug')('google-cdn');
var requote = require('regexp-quote');

var data = require('./lib/data');
var bowerUtil = require('./util/bower');


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


function isFunction(fn) {
  return typeof(fn) === 'function';
}

function regexEndIndexOf(string, regex, startpos) {
    var result = regex.exec(string.substring(startpos || 0));
    return (result && result.index >= 0) ? (result.index + (startpos || 0) + result[0].length) : -1;
}

function regexLastIndexOf(string, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = string.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = string.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    var result;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}


module.exports = function cdnify(content, bowerJson, options, callback) {

  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  options = options || {};
  options.componentsPath = options.componentsPath || 'bower_components';

  var cdn = options.cdn || 'google';
  var cdnData = data[cdn];

  if (!cdnData) {
    return callback(new Error('CDN ' + cdn + ' is not supported.'));
  }

  function buildReplacement(name, callback) {
    var item = cdnData[name];
    var versionStr = getVersionStr(bowerJson, name);

    if (!versionStr) {
      return callback();
    }

    var version = semver.maxSatisfying(item.versions, versionStr);
    if (version) {
      debug('Choosing version %s for dependency %s', version, name);

      bowerUtil.resolveMainPath(name, versionStr, function (err, main) {
        if (err) {
          return callback(err);
        }

        // Replace leading slashes if present.
        var fromRe = '/?' + requote(bowerUtil.joinComponent(options.componentsPath, main));
        var from = new RegExp(fromRe);
        var to = (isFunction(item.url)) ? item.url(version) : item.url;

        callback(null, { test: item.test, from: from, to: to });
      });
    } else {
      debug('Could not find satisfying version for %s %s', name, versionStr);
      callback();
    }
  }

  async.map(Object.keys(cdnData), buildReplacement, function (err, replacements) {
    if (err) {
      return callback(err);
    }

    replacements.forEach(function (replacement) {
      if (replacement) {
        if (options.useFallback && replacement.test) {
          var replacementResult = replacement.from.exec(content);

          if (replacementResult) {
            var replacementStartIndex = replacementResult.index
              , replacementEndIndex = replacementStartIndex + replacementResult[0].length
              , scriptStart = new RegExp("<\s*script")
              , scriptEnd = new RegExp("/\s*script\s*>")
              , scriptStartIndex = regexLastIndexOf(content, scriptStart, replacementStartIndex)
              , scriptEndIndex = regexEndIndexOf(content, scriptEnd, replacementEndIndex);

            if (scriptStartIndex > 0 && scriptEndIndex > 0) {
              content = content.substr(0, replacementStartIndex)
                        + replacement.to
                        + content.substr(replacementEndIndex, scriptEndIndex - replacementEndIndex)
                        + os.EOL
                        + "<script>"+replacement.test+" || document.write('<script src=\""+ replacementResult[0] +"\"><\\/script>')</script>"
                        + content.substr(scriptEndIndex);
              debug('Replaced %s with %s with local fallback to %s', replacement.from, replacement.to, replacementResult[0]);
            }
          }
        }
        else {
          content = content.replace(replacement.from, replacement.to);
          debug('Replaced %s with %s', replacement.from, replacement.to);
        }
      }
    });

    callback(null, content);
  });
};
