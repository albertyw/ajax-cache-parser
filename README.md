ajax-cache-parser
=================

[![NPM](https://nodei.co/npm/ajax-cache-parser.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ajax-cache-parser/)

[ ![Codeship Status for albertyw/ajax-cache-parser](https://codeship.com/projects/86d1e680-ba55-0133-baa7-025ac38368ea/status?branch=master)](https://codeship.com/projects/135666)
[![Code Climate](https://codeclimate.com/github/albertyw/ajax-cache-parser/badges/gpa.svg)](https://codeclimate.com/github/albertyw/ajax-cache-parser)
[![Test Coverage](https://codeclimate.com/github/albertyw/ajax-cache-parser/badges/coverage.svg)](https://codeclimate.com/github/albertyw/ajax-cache-parser/coverage)
[![Dependency Status](https://gemnasium.com/albertyw/ajax-cache-parser.svg)](https://gemnasium.com/albertyw/ajax-cache-parser)

A small function to get when an ajax request expires

Given an XMLHttpRequest object that has received response headers back from a server, `getCacheExpiry` will return
a javascript `Date` object that represents when the response will expire based on the `Expires` and `Cache-Control`
response headers.  If caching headers are not present or are unparseable, `undefined` will be returned.  If caching
headers indicate that the resource should not be cached, `null` will be returned.

Example
-------
```javascript
function callback(){
  var expiration = parser.getCacheExpiry(this);
  // do something with expiration
}
var oReq = new XMLHttpRequest();
oReq.onload = callback;
oReq.open("get", yourUrl, true);
oReq.send();
```

Information about caching headers comes from: https://www.mnot.net/cache_docs/
