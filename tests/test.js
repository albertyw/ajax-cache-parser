var assert = require("assert");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var parser = require("../cache_expiry_parser");

// Mock XMLHttpRequest response
function FakeXHR(expiresHeader, cacheControlHeader){
  this.expiresHeader = expiresHeader || null;
  this.cacheControlHeader = cacheControlHeader || null;
  this.getResponseHeader = function(header){
    if(header=='Expires') return this.expiresHeader;
    if(header=='Cache-Control') return this.cacheControlHeader;
  }
}

// Assert that date1 and date2 are approximately the same (< 1 second difference)
function assertDateEqual(date1, date2){
  var timestamp1 = date1.getTime();
  var timestamp2 = date2.getTime();
  assert(Math.abs(timestamp1 - timestamp2) < 1000);
}

describe("#nowPlusSeconds", function(){
  it("will return the correct time", function(){
    var currentTimestamp = new Date().getTime() / 1000;
    var epoch = parser.nowPlusSeconds(-currentTimestamp);
    assertDateEqual(epoch, new Date(0));
  });
});

describe("#getCacheExpiry", function(){
  describe("with no expiry headers", function(){
    it("will return null", function(){
      var xhr = new FakeXHR();
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
  describe("reading from Expires header", function(){
    it("will return the expires header if the cache control doesn't exist", function(){
      var xhr = new FakeXHR('Sun, 07 Sep 2100 09:16:06 GMT');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry.toISOString(), "2100-09-07T09:16:06.000Z");
    });
    it("will act like there is no Expires header if it is unparseable", function(){
      var xhr = new FakeXHR('foo');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
  describe("reading from the Cache-Control header", function(){
    it("will return the time computed from max-age", function(){
      var xhr = new FakeXHR(null, 'max-age=86400');
      var expiry = parser.getCacheExpiry(xhr);
      var expectedExpiry = parser.nowPlusSeconds(86400);
      assertDateEqual(expiry, expectedExpiry);
    });
    it("will return undefined if there is no max-age", function(){
      var xhr = new FakeXHR(null, 's-maxage=86400');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it("will return undefined if the max-age is invalid", function(){
      var xhr = new FakeXHR(null, 'max-age=asdf');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it("will ignore s-maxage", function(){
      var xhr = new FakeXHR(null, 's-maxage=86400');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it("will include times with the public keyword", function(){
      var xhr = new FakeXHR(null, 'max-age=3600, public');
      var expiry = parser.getCacheExpiry(xhr);
      var expectedExpiry = parser.nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it("will include times with the private keyword", function(){
      var xhr = new FakeXHR(null, 'max-age=3600, private');
      var expiry = parser.getCacheExpiry(xhr);
      var expectedExpiry = parser.nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it("will return null for no-cache", function(){
      var xhr = new FakeXHR(null, 'no-cache');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it("will return null for no-store", function(){
      var xhr = new FakeXHR(null, 'no-cache');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it("will ignore the must-revalidate keyword", function(){
      var xhr = new FakeXHR(null, 'no-cache, must-revalidate');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it("will ignore the proxy-revalidate keyword", function(){
      var xhr = new FakeXHR(null, 'max-age=3600, proxy-revalidate');
      var expiry = parser.getCacheExpiry(xhr);
      var expectedExpiry = parser.nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it("will ignore unknown keywords", function(){
      var xhr = new FakeXHR(null, 'max-age=3600, asdf, qwer');
      var expiry = parser.getCacheExpiry(xhr);
      var expectedExpiry = parser.nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
  });
  describe("sanity checking", function(){
    it("will nullify expiration times in the past", function(){
      var xhr = new FakeXHR('Thr, 01 Jan 1970 00:00:00 GMT', undefined);
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
});

describe("getting expiry", function(){
  it("will work for the google logo", function(done){
    function callback(){
      var expiration = parser.getCacheExpiry(this);
      assert.notEqual(expiration, undefined);
      assert.notEqual(expiration, null);
      assert(expiration instanceof Date);
      done();
    }
    var oReq = new XMLHttpRequest();
    oReq.onload = callback;
    oReq.open("get", "https://www.google.com/images/srpr/logo11w.png", true);
    oReq.send();
  });
});
