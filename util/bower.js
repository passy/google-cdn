'use strict';

var bower = require('bower');
var path = require('path');
var debug = require('debug')('google-cdn');
var bowerUtil = module.exports;

bowerUtil.joinComponent = function joinComponent(directory, component) {
  var dirBits = directory.split(path.sep);
  // Always join the path with a forward slash, because it's used to replace the
  // path in HTML.
  return path.join(dirBits.join('/'), component).replace(/\\/g, '/');
};

function extractFile(supportedTypes, files, main) {
  supportedTypes.types.forEach(function (type) {
    if (supportedTypes.typesRegex[type].test(main)) {
      files[type] = main;
    }
  });
}

function findMainFiles(supportedTypes, component, main) {
  var mainFiles = {};
  if (Array.isArray(main)) {
    main.forEach(function (name) {
        if (name) {
          extractFile(supportedTypes, mainFiles, name);
        }
      }
    );
  } else if (typeof(main) === 'string') {
    extractFile(supportedTypes, mainFiles, main);
  } else {
    debug('Cannot determine main property');
    supportedTypes.types.forEach(function (type) {
      mainFiles[type] = component.replace(new RegExp(type + '$', 'i'), '') + '.' + type;
    });
  }
  return mainFiles;
}


bowerUtil.resolveMainPath = function resolveMain(supportedTypes, component, version, callback) {
  debug('resolving main property for component %s#%s', component, version);
  bower.commands.info(component + '#' + version, 'main').on('end', function (main) {
    var mainFiles = findMainFiles(supportedTypes, component, main);
    for (var type in mainFiles) {
      mainFiles[type] = bowerUtil.joinComponent(component, mainFiles[type]);
    }
    callback(null, mainFiles);
  }).on('error', callback);
};
