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

// Similar to String.indexOf, but with regular expressions
// Returns the index of the match or -1
function regexIndexOf(string, regex, startpos) {
  var result = regex.exec(string.substring(startpos || 0));
  return (result && result.index >= 0) ? (result.index + (startpos || 0)) : -1;
}

// Similar to String.indexOf, but with regular expressions
// Returns the index after the last character in the match or -1
function regexEndIndexOf(string, regex, startpos) {
  var result = regex.exec(string.substring(startpos || 0));
  return (result && result.index >= 0) ? (result.index + (startpos || 0) + result[0].length) : -1;
}

// Similar to String.lastIndexOf, but with regular expressions
// Returns the index of the match (searching backwards from startpos) or -1
function regexLastIndexOf(string, regex, startpos) {
  regex = (regex.global) ? regex : new RegExp(regex.source, 'g' + (regex.ignoreCase ? 'i' : '') + (regex.multiLine ? 'm' : ''));
  if(typeof (startpos) === 'undefined') {
    startpos = string.length;
  } else if(startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = string.substring(0, startpos + 1),
    lastIndexOf = -1,
    nextStop = 0,
    result;
  while((result = regex.exec(stringToWorkWith)) !== null) {
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

        var fromStr = bowerUtil.joinComponent(options.componentsPath, main),
          fromRegExp = new RegExp('/?' + requote(fromStr), 'g'),  // Replace leading slashes if present.
          toStr = (isFunction(item.url)) ? item.url(version) : item.url,
          toRegExp = new RegExp(requote(toStr));

        callback(null, {
          test: item.test,
          fromRegExp: fromRegExp,
          fromStr: fromStr,
          toRegExp: toRegExp,
          toStr: toStr
        });
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
        // do replacement
        content = content.replace(replacement.fromRegExp, replacement.toStr);
        debug('Replaced %s with %s', replacement.fromStr, replacement.toStr);

        // add fallback script block if specified in options
        if (options.useFallback && replacement.test) {
          var replacementStartIndex = -1;

          while ((replacementStartIndex = regexIndexOf(content, replacement.toRegExp, replacementStartIndex+1)) !== -1) {
            var replacementEndIndex = replacementStartIndex + replacement.toStr.length,
              scriptStart = /<\s*script/,
              scriptEnd = /<\s*\/\s*script\s*>/,
              scriptStartIndex = regexLastIndexOf(content, scriptStart, replacementStartIndex),
              scriptEndIndex = regexEndIndexOf(content, scriptEnd, replacementEndIndex);

            if (scriptStartIndex >= 0 && scriptEndIndex > 0) {
              content = content.substr(0, replacementStartIndex) +
                        replacement.toStr +
                        content.substr(replacementEndIndex, scriptEndIndex - replacementEndIndex) +
                        os.EOL +
                        '<script>' + replacement.test + ' || document.write(\'<script src=\"' + replacement.fromStr + '\"><\\/script>\')</script>' +
                        content.substr(scriptEndIndex);
              debug('Added local fallback to %s', replacement.fromStr);
            }
          }
        }
      }
    });

    callback(null, content);
  });
};
