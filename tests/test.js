var assert = require("assert");
var parser = require("../cache_expiry_parser");

// Mock for a XMLHttpRequest response
function FakeXHR(expiresHeader, cacheControlHeader){
  this.expiresHeader = expiresHeader;
  this.cacheControlHeader = cacheControlHeader;
  this.getResponseHeader = function(header){
    if(header=='Expires') return this.expiresHeader;
    if(header=='Cache-Control') return this.cacheControlHeader;
  }
}


describe("#getCacheExpiry", function(){
  describe("reading from expires header", function(){
    it("will return the expires header if the cache control doesn't exist", function(){
      var xhr = new FakeXHR('Sun, 07 Sep 2014 09:16:06 GMT', null);
      var expiry = parser.getCacheExpiry(xhr);
      assert.equal(expiry.toISOString(), "2014-09-07T09:16:06.000Z");
    });
  });
});

// max-age=86400
// Sun, 07 Sep 2014 09:16:06 GMT
// null

