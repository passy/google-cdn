'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var debug = require('debug')('google-cdn');
var bowerUtil = module.exports;


bowerUtil.joinComponent = function joinComponent(directory, component) {
  var dirBits = directory.split(path.sep);

  // Always join the path with a forward slash, because it's used to replace the
  // path in HTML.
  return path.join(dirBits.join('/'), component).replace(/\\/g, '/');
};


function findJSMainFile(componentData) {
  var main = componentData.main;
  if (Array.isArray(main)) {
    var js = main.filter(function (name) {
      return (/\.js$/i).test(name);
    });

    if (js.length === 1) {
      return js[0];
    }
  }

  debug('Cannot determine main property');
  return componentData.name.replace(/js$/i, '') + '.js';
}


bowerUtil.resolveMainPath = function resolveMain(component, version, callback) {
  var args = ['info', '--json', component + '#' + version];
  var output = '';
  debug('resolving main property for component %s#%s', component, version);
  var ps = spawn('bower', args, {
    stdio: ['ignore', 'pipe', 'ignore']
  });

  ps.stdout.on('data', function (data) {
    output += data;
  });

  ps.on('close', function (code) {
    debug('bower exited with status code %d', code);
    if (code !== 0) {
      return callback(new Error('bower exited non-zero with ' + code));
    }

    var data = JSON.parse(output);
    var main = findJSMainFile(data);
    callback(null, data.name + '/' + main);
  });
};
