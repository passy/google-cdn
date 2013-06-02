/*global describe, it */

'use strict';
var assert = require('assert');
var cdn = require('./index');

describe('google-cdn', function () {
  it('should load', function () {
    assert(cdn !== undefined);
  });
});
