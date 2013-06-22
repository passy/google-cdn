/*global describe, it, beforeEach */

'use strict';
var path = require('path');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var googlecdn = require('./googlecdn');

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
    assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>');
  });

  it('should replace jquery ui', function () {
    var source = '<script src="bower_components/jquery-ui/ui/jquery-ui.js"></script>';
    var bowerConfig = {
      dependencies: { 'jquery-ui': '~1.10.3' }
    };

    var result = googlecdn(source, bowerConfig);
    assert.equal(result, '<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>');
  });
});

describe('util/bower', function () {
  beforeEach(function () {
    this.pathMock = {
      join: path.join,
      sep: '/'  // Always test the unix way by default.
    };

    this.util = proxyquire('./util/bower', {
      path: this.pathMock
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
});
