'use strict';

var fs = require('fs');
var googlecdn = require('../googlecdn.js');

var index = fs.readFileSync('index.html', { encoding: 'utf-8' });
var bowerJson = require('./bower.json');

googlecdn(index, bowerJson, {useLocalFallback: true}, function (err, content) {
  if (err) {
    throw err;
  }

  fs.writeFileSync('dist.html', content);
  console.log('Wrote cdnified version to dist.html');
});
