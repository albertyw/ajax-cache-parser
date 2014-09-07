var assert = require("assert");
var parser = require("../cache_expiry_parser");

// Mock for a XMLHttpRequest response
function FakeXHR(expiresHeader, cacheControlHeader){
  if(expiresHeader === undefined) expiresHeader = null;
  if(cacheControlHeader === undefined) cacheControlHeader = null;
  this.expiresHeader = expiresHeader;
  this.cacheControlHeader = cacheControlHeader;
  this.getResponseHeader = function(header){
    if(header=='Expires') return this.expiresHeader;
    if(header=='Cache-Control') return this.cacheControlHeader;
  }
}


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
      var xhr = new FakeXHR('Sun, 07 Sep 2014 09:16:06 GMT');
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry.toISOString(), "2014-09-07T09:16:06.000Z");
    });
    it("will return null if the Expires header is in the past");
    it("will act like there is no Expires header if it is unparseable");
  });
  describe("reading from the Cache-Control header", function(){
    it("will return the time computed from max-age");
    it("will ignore s-maxage");
    it("will include times with the public keyword");
    it("will include times with the private keyword");
    it("will return null for no-cache");
    it("will return null for no-store");
    it("will ignore the must-revalidate keyword");
    it("will ignore the proxy-revalidate keyword");
  });
});

// max-age=86400
// Sun, 07 Sep 2014 09:16:06 GMT
// null

