import assert from 'assert';
import { XMLHttpRequest } from 'xmlhttprequest';
import { getCacheExpiry, nowPlusSeconds } from '../cache_expiry_parser.js';

// Mock XMLHttpRequest response
function FakeXHR(expiresHeader, cacheControlHeader){
  this.expiresHeader = expiresHeader || null;
  this.cacheControlHeader = cacheControlHeader || null;
  this.getResponseHeader = function(header){
    if(header=='Expires') return this.expiresHeader;
    if(header=='Cache-Control') return this.cacheControlHeader;
  };
}

// Assert that date1 and date2 are approximately the same (< 1 second difference)
function assertDateEqual(date1, date2){
  const timestamp1 = date1.getTime();
  const timestamp2 = date2.getTime();
  assert(Math.abs(timestamp1 - timestamp2) < 1000);
}

describe('#nowPlusSeconds', function(){
  it('will return the correct time', function(){
    const currentTimestamp = new Date().getTime() / 1000;
    const epoch = nowPlusSeconds(-currentTimestamp);
    assertDateEqual(epoch, new Date(0));
  });
});

describe('#getCacheExpiry', function(){
  describe('with no expiry headers', function(){
    it('will return null', function(){
      const xhr = new FakeXHR();
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
  describe('reading from Expires header', function(){
    it('will return the expires header if the cache control does not exist', function(){
      const xhr = new FakeXHR('Sun, 07 Sep 2100 09:16:06 GMT');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry.toISOString(), '2100-09-07T09:16:06.000Z');
    });
    it('will act like there is no Expires header if it is unparseable', function(){
      const xhr = new FakeXHR('foo');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
  describe('reading from the Cache-Control header', function(){
    it('will return the time computed from max-age', function(){
      const xhr = new FakeXHR(null, 'max-age=86400');
      const expiry = getCacheExpiry(xhr);
      const expectedExpiry = nowPlusSeconds(86400);
      assertDateEqual(expiry, expectedExpiry);
    });
    it('will return undefined if there is contradictory cache age', function(){
      const xhr = new FakeXHR(null, 'no-cache, max-age=86400');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it('will return undefined if there is no max-age', function(){
      const xhr = new FakeXHR(null, 's-maxage=86400');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it('will return undefined if the max-age is invalid', function(){
      const xhr = new FakeXHR(null, 'max-age=asdf');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it('will ignore s-maxage', function(){
      const xhr = new FakeXHR(null, 's-maxage=86400');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, undefined);
    });
    it('will include times with the public keyword', function(){
      const xhr = new FakeXHR(null, 'max-age=3600, public');
      const expiry = getCacheExpiry(xhr);
      const expectedExpiry = nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it('will include times with the private keyword', function(){
      const xhr = new FakeXHR(null, 'max-age=3600, private');
      const expiry = getCacheExpiry(xhr);
      const expectedExpiry = nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it('will return null for no-cache', function(){
      const xhr = new FakeXHR(null, 'no-cache');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it('will return null for no-store', function(){
      const xhr = new FakeXHR(null, 'no-cache');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it('will ignore the must-revalidate keyword', function(){
      const xhr = new FakeXHR(null, 'no-cache, must-revalidate');
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
    it('will ignore the proxy-revalidate keyword', function(){
      const xhr = new FakeXHR(null, 'max-age=3600, proxy-revalidate');
      const expiry = getCacheExpiry(xhr);
      const expectedExpiry = nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
    it('will ignore unknown keywords', function(){
      const xhr = new FakeXHR(null, 'max-age=3600, asdf, qwer');
      const expiry = getCacheExpiry(xhr);
      const expectedExpiry = nowPlusSeconds(3600);
      assertDateEqual(expiry, expectedExpiry);
    });
  });
  describe('sanity checking', function(){
    it('will nullify expiration times in the past', function(){
      const xhr = new FakeXHR('Thr, 01 Jan 1970 00:00:00 GMT', undefined);
      const expiry = getCacheExpiry(xhr);
      assert.equal(expiry, null);
    });
  });
});

describe('getting expiry', function(){
  it('will work for the google logo', function(done){
    function callback(){
      const expiration = getCacheExpiry(this);
      assert.notEqual(expiration, undefined);
      assert.notEqual(expiration, null);
      assert(expiration instanceof Date);
      done();
    }
    const oReq = new XMLHttpRequest();
    oReq.onload = callback;
    oReq.open('get', 'https://www.google.com/images/srpr/logo11w.png', true);
    oReq.send();
  });
});
