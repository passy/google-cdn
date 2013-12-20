# google-cdn [![Build Status](https://secure.travis-ci.org/passy/google-cdn.png?branch=master)](http://travis-ci.org/passy/google-cdn)

> Grunt task for replacing refs to resources on the [Google CDN](https://developers.google.com/speed/libraries/devguide).

This module makes it easy to replace references to your bower resources in your
app with links to the libraries on the Google CDN.

## Getting started

Install: `npm install --save google-cdn`

### Example

*bower.json*:

```json
{
  "name": "my-awesome-app",
  "dependencies": {
    "jquery": "~2.0.0"
  }
}
```

```javascript
var googlecdn = require('google-cdn');

var bowerConfig = loadJSON('bower.json');
var markup = '<script src="bower_components/jquery/jquery.js"></script>';
googlecdn(markup, bowerConfig, function (err, result) {
  if (err) {
    throw err;
  }

  assert.equal(result,
    '<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>');
});
```

## API

### googlecdn(content, bowerJson[, options], callback)

Replaces references to libraries supported by the Google CDN in `content`.
The library versions are inferred from the `bowerJson`.

`options` is an optional object with these keys:

  - `componentsPath`: defaults to `bower_components`, the path you specify in
    your script tags to the components directory.
  - `cdn`: defaults to `google`. CDN you want to use. Possible values: `google`,
    `cdnjs` or object of the following format:

  ```javascript
  {
    jquery: {
      versions: ['2.0.3', '2.0.2', '2.0.1', '2.0.0'],
      url: function (version) {
        return '//my.own.cdn/libs/jquery/' + version + '/jquery.min.js';
      }
    }
  }
  ```

## Grunt

You can use this module in grunt through the [grunt-google-cdn](https://github.com/btford/grunt-google-cdn)
plugin, which this module's code is based of.

## Debugging

You can turn on debugging by setting the `DEBUG` environment variable to
`google-cdn`. E.g.

`env DEBUG='google-cdn' grunt cdnify`

## License

BSD
