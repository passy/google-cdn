/*global describe, it, beforeEach */

'use strict';
var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var googlecdn = require('./googlecdn');
var EventEmitter = require('events').EventEmitter;

describe('google-cdn', function () {
  it('should load', function () {
    assert(googlecdn !== undefined);
  });

  it('should replace jquery', function () {
    var source = '<script src="bower_components/jquery/jquery.js"></script>';
    var bowerConfig = {
      dependencies: { jquery: '~2.0.0' }
    };

    var result = googlecdn(source, bowerConfig);
    assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>');
  });

  it('should replace jquery ui', function () {
    var source = '<script src="bower_components/jquery-ui/ui/jquery-ui.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery-ui': '~1.10.3' }
    };

    var result = googlecdn(source, bowerConfig);
    assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>');
  });

  it('should support cdnjs', function () {
    var source = '<script src="bower_components/jquery/jquery.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery': '~2.0.1' }
    };

    var result = googlecdn(source, bowerConfig, { cdn: 'cdnjs' });
    assert.equal(result, '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>');
  });
});

describe('util/bower', function () {
  beforeEach(function () {
    this.pathMock = {
      join: path.join,
      sep: '/'  // Always test the unix way by default.
    };

    this.processData = '';
    this.spawnMock = function spawnMock() {
      var ps = new EventEmitter();

      ps.stdout = new EventEmitter();

      process.nextTick(function () {
        ps.stdout.emit('data', this.processData);
        ps.emit('close', 0);
      }.bind(this));

      return ps;
    }.bind(this);

    this.util = proxyquire('./util/bower', {
      path: this.pathMock,
      /*jshint camelcase:false */
      child_process: {
        spawn: this.spawnMock
      }
    });
  });

  it('joinComponent', function () {
    var result = this.util.joinComponent('bower_components', 'jquery/jquery-2.0.js');
    assert.equal(result, 'bower_components/jquery/jquery-2.0.js');
  });

  it('should join on w32', function () {
    this.pathMock.sep = '\\';
    var result = this.util.joinComponent('bower_components', 'jquery\\jquery-2.0.js');
    assert.equal(result, 'bower_components/jquery/jquery-2.0.js');
  });

  it('should resolve jquery to a main path', function (cb) {
    this.processData = fs.readFileSync('./fixture/jquery-2.0.0.json');
    this.util.resolveMainPath('jquery', '2.0.0', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'jquery/jquery.js');
      cb();
    });
  });

  it('should resolve jquery-ui to a main path', function (cb) {
    this.processData = fs.readFileSync('./fixture/jquery-ui-1.10.3.json');
    this.util.resolveMainPath('jquery-ui', '1.10.3', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'jquery-ui/ui/jquery-ui.js');
      cb();
    });
  });

  it('should resolve just js for multiple main files', function (cb) {
    this.processData = fs.readFileSync('./fixture/multiple-main.json');
    this.util.resolveMainPath('multiple-main', '1.10.3', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'multiple-main/lib/multiple.js');
      cb();
    });
  });

  it('should fall fall back to name w/o main', function (cb) {
    this.processData = fs.readFileSync('./fixture/no-main.json');
    this.util.resolveMainPath('no-main', '1.0', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'no-main/no-main.js');
      cb();
    });
  });
});
