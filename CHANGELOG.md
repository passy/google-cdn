<a name="1.1.0"></a>
# [1.1.0](https://github.com/passy/google-cdn/compare/v1.0.0...v1.1.0) (2016-04-16)


### Features

* **cdn:** accept array of CDN hosts ([40ace31](https://github.com/passy/google-cdn/commit/40ace31))
* **cdnjs:** check for matching bower packages by removing `.js` from the name ([548fc8b](https://github.com/passy/google-cdn/commit/548fc8b))



<a name="1.0.0"></a>
## 1.0.0 (2014-11-26)


#### Features

* **deps:** Upgrade to semver 4 ([38b6eb84](http://github.com/passy/google-cdn/commit/38b6eb8441c9493fb0cf82a5bd47d700ec5f73f0))


<a name="1.0.0"></a>
## 1.0.0 (2014-11-26)


<a name="0.7.0"></a>
## 0.7.0 (2014-08-23)


#### Features

* **cdnify:** expose an replacementInfo in the callback ([217c1c1d](http://github.com/passy/google-cdn/commit/217c1c1d66e723db0b9be843a7e29967a7202ecf))


<a name="v0.5.1"></a>
### v0.5.1 (2014-03-23)


#### Bug Fixes

* **cdnify:** throw if bowerJson is missing ([6d583a6d](http://github.com/passy/google-cdn/commit/6d583a6d4066780a45a045a208c2f71cbb22e5e7))

<a name="v0.5.0"></a>
## v0.5.0 (2014-03-07)


#### Features

* **cdnify:** support 'all' flag in cdn data ([db3550c5](http://github.com/passy/google-cdn/commit/db3550c57535cec2d89cf7548605e12ef790135b))

<a name="v0.4.0"></a>
## v0.4.0 (2014-02-04)


#### Features

* **data:** update cdnjs data ([b7a4e45f](http://github.com/passy/google-cdn/commit/b7a4e45ff2932f11bd91b79d3d75b97ac6d2d3a0))

<a name="v0.3.0"></a>
## v0.3.0 (2014-01-11)


#### Bug Fixes

* **bower:** main path resolving bug fixes ([3d68ebd1](http://github.com/passy/google-cdn/commit/3d68ebd1ff104086906de3300425d70f93fa7f36))


#### Features

* **cdnify:** allow passing a cdn data object in options ([778258fc](http://github.com/passy/google-cdn/commit/778258fc384ede18146c62264df9be656a2dfbe2))
* **data:** angular 1.2.7, 1.2.8 ([0b582be5](http://github.com/passy/google-cdn/commit/0b582be55044434de9daeedc15c5a3c2dd0ecb9b))

<a name="v0.2.3"></a>
### v0.2.3 (2013-10-12)


#### Bug Fixes

* **data:** remove non-existent jQuery version

<a name="v0.2.2"></a>
### v0.2.2 (2013-08-31)


#### Features

* **data:** add AngularJS 1.0.8 ([72e44f01](http://github.com/passy/google-cdn/commit/72e44f0121153942a9b77b987c1c3570474ad2d5))

<a name="v0.2.1"></a>
### v0.2.1 (2013-08-11)


#### Bug Fixes

* **cdnify:** strip leading slashes ([4e01423f](http://github.com/passy/google-cdn/commit/4e01423fb22451f2df95c7d74c071b30d9585c31))


#### Features

* **data:** dojo, swfobject for google CDN ([bdb5c3b7](http://github.com/passy/google-cdn/commit/bdb5c3b7b848d842bea401007c13dee8175b3299))

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
