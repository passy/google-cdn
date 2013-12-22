/*global describe, it, beforeEach */

'use strict';
var path = require('path');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var bowerUtil = require('./util/bower');
var EventEmitter = require('events').EventEmitter;

describe('google-cdn', function () {
  beforeEach(function () {
    this.mainPath = '';

    this.googlecdn = proxyquire('./googlecdn', {
      './util/bower': {
        resolveMainPath: function (name, version, cb) {
          cb(null, this.mainPath);
        }.bind(this),
        joinComponent: bowerUtil.joinComponent
      }
    });
  });

  it('should load', function () {
    assert(this.googlecdn !== undefined);
  });

  it('should replace jquery', function (cb) {
    var source = '<script src="bower_components/jquery/jquery.js"></script>';
    var bowerConfig = {
      dependencies: { jquery: '~2.0.0' }
    };

    this.mainPath = 'jquery/jquery.js';

    this.googlecdn(source, bowerConfig, function (err, result) {
      if (err) {
        return cb(err);
      }

      assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>');
      cb();
    });
  });

  it('should replace jquery ui', function (cb) {
    var source = '<script src="bower_components/jquery-ui/ui/jquery-ui.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery-ui': '~1.10.3' }
    };

    this.mainPath = 'jquery-ui/ui/jquery-ui.js';

    this.googlecdn(source, bowerConfig, function (err, result) {
      if (err) {
        return cb(err);
      }

      assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>');
      cb();
    });
  });

  it('should support cdnjs', function (cb) {
    var source = '<script src="bower_components/jquery/jquery.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery': '~2.0.1' }
    };

    this.mainPath = 'jquery/jquery.js';

    this.googlecdn(source, bowerConfig, { cdn: 'cdnjs' }, function (err, result) {
      if (err) {
        return cb(err);
      }

      assert.equal(result, '<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>');
      cb();
    });
  });

  it('should strip leading slashes', function (cb) {
    var source = '<script src="/bower_components/jquery/jquery.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery': '2.0.3' }
    };

    this.mainPath = 'jquery/jquery.js';

    this.googlecdn(source, bowerConfig, function (err, result) {
      if (err) {
        return cb(err);
      }

      assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>');
      cb();
    });
  });
});

describe('util/bower', function () {
  beforeEach(function () {
    this.pathMock = {
      join: path.join,
      sep: '/'  // Always test the unix way by default.
    };

    this.queryResult = '';
    this.bowerInfoMock = function bowerInfoMock() {
      var query = new EventEmitter();

      process.nextTick(function () {
        query.emit('end', this.queryResult);
      }.bind(this));

      return query;
    }.bind(this);

    this.util = proxyquire('./util/bower', {
      path: this.pathMock,
      bower: {
        commands: {
          info: this.bowerInfoMock
        }
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
    this.queryResult = 'jquery.js';
    this.util.resolveMainPath('jquery', '2.0.0', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'jquery/jquery.js');
      cb();
    });
  });

  it('should resolve jquery-ui to a main path', function (cb) {
    this.queryResult = ['ui/jquery-ui.js'];
    this.util.resolveMainPath('jquery-ui', '1.10.3', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'jquery-ui/ui/jquery-ui.js');
      cb();
    });
  });

  it('should resolve just js for multiple main files', function (cb) {
    this.queryResult = ['css/multiple.css', 'lib/multiple.js'];
    this.util.resolveMainPath('multiple-main', '1.10.3', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'multiple-main/lib/multiple.js');
      cb();
    });
  });

  it('should fall fall back to name w/o main', function (cb) {
    this.queryResult = undefined;
    this.util.resolveMainPath('no-main', '1.0', function (err, path) {
      if (err) {
        cb(err);
      }

      assert.equal(path, 'no-main/no-main.js');
      cb();
    });
  });
});
