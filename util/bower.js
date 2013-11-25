'use strict';

var path = require('path');
var exec = require('child_process').exec;
var debug = require('debug')('google-cdn');
var bowerUtil = module.exports;


bowerUtil.joinComponent = function joinComponent(directory, component) {
  var dirBits = directory.split(path.sep);

  // Always join the path with a forward slash, because it's used to replace the
  // path in HTML.
  return path.join(dirBits.join('/'), component).replace(/\\/g, '/');
};


function findJSMainFile(componentData) {
  var main = componentData.main,
    validMainRegExp = /\.js$/i;

  if (Array.isArray(main)) {
    var js = main.filter(function (name) {
      return validMainRegExp.test(name);
    });

    if (js.length === 1) {
      return js[0];
    }
  }
  else if(main !== null) {
    if (validMainRegExp.test(main)) {
      return main;
    }
  }

  debug('Cannot determine main property');
  return componentData.name.replace(/js$/i, '') + '.js';
}


bowerUtil.resolveMainPath = function resolveMain(component, version, callback) {
  debug('Resolving main property for component %s#%s', component, version);

  var cmd = 'bower info --json ' + component + '#' + version;
  var ps = exec(cmd, function (error, stdout, stderr) {
    if (error !== null) {
      return callback(new Error('bower exited non-zero with ' + error.code));
    }
    var data = JSON.parse(stdout);
    var main = findJSMainFile(data);
    callback(null, data.name + '/' + main);
  });
};
