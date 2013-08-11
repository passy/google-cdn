<a name="v0.2.0"></a>
## v0.2.0 (2013-08-11)


#### Bug Fixes

* **data:** filter out invalid semvers ([1c3552e9](http://github.com/passy/google-cdn/commit/1c3552e9acb97aecbb9128eab9bc448385e1bf81))


#### Features

* **cdnify:**
  * run bower lookups in parallel ([00a1c9ce](http://github.com/passy/google-cdn/commit/00a1c9ceb9d6baeaa2a761cd4cdc83875f70b1f2))
  * change to asynchronous API ([17ea90ce](http://github.com/passy/google-cdn/commit/17ea90ce0249606e28036ba249438916d41a84f9))
  * preparations for multi-cdn support ([5a73bea0](http://github.com/passy/google-cdn/commit/5a73bea017456d97ccedce241853e82010720bb3))
* **data:**
  * full heuristic cdnjs support ([d6e9830c](http://github.com/passy/google-cdn/commit/d6e9830c494c3bcc02c39beaf4566ceee88779f2))
  * add cdnjs support for jquery ([eb215d9d](http://github.com/passy/google-cdn/commit/eb215d9d7a66a6a57c3673844ee41b4010ac8398))
* **util:** add bower main resolver ([104e1aa2](http://github.com/passy/google-cdn/commit/104e1aa28bc800ff3980f01df557044e29dee332))


### Breaking Changes

* `googlecdn` is no longer synchronous and requires a callback
* Hoisting is no longer supported. If you relied on this, please get in touch.
  It looked like nobody would be using it.
