/**
 * Get the expiry time of an XMLHttpRequest response
 * returns a Date object for when the request expires
 * returns null if there is valid data that says not to cache
 * returns undefined if there is no caching information
 **/

function getCacheExpiry(xhr){
  var expiresHeader = xhr.getResponseHeader('Expires');
  var cacheControlHeader = xhr.getResponseHeader('Cache-Control');

  var expiry = parseCacheControlHeader(cacheControlHeader);
  if(expiry === undefined) {
    expiry = parseExpiresHeader(expiresHeader);
  }
  expiry = nullifyInvalidExpiration(expiry);
  return expiry;
}

/**
 * Parse the data in the Cache-Control header for information
 * returns Date object if the Cache-Control header is valid
 * returns null if there is a valid Cache-Control header that says not to cache
 * returns undefined if there is no valid Cache-Control header
 **/
function parseCacheControlHeader(cacheControlHeader){
  if(cacheControlHeader === null || cacheControlHeader === undefined){
    return undefined;
  }
  var headerData = cacheControlHeader.split(",");
  var expiry = undefined;
  var keyword;
  for(var i=0; i<headerData.length; i++){
    keyword = headerData[i].trim();
    if(keyword.indexOf("max-age") > -1){
      expiry = parseCacheControlAge(keyword, expiry);
    }else{
      expiry = parseCacheControlKeyword(keyword, expiry);
    }
  }
  return expiry;
}

/**
 * Parse the max-age value from the Cache-Control header data
 * returns Date object if the max-age value is valid
 * returns undefined if there is no valid data
 **/
function parseCacheControlAge(maxAge, expiry){
  if(expiry === null){
    return expiry;
  }
  var seconds = maxAge.split('=')[1].trim();
  seconds = parseInt(seconds);
  if(isNaN(seconds)){
    return undefined;
  }else{
    return nowPlusSeconds(seconds);
  }
}

/**
 * Parse non-max-age keywords in the Cache-Control header
 * returns expiry Date, undefined, or null depending on the keyword behavior
 **/
function parseCacheControlKeyword(keyword, expiry){
  if(keyword.indexOf("public") > -1 || keyword.indexOf("private") > -1){
    return expiry;
  }
  if(keyword.indexOf("no-cache") > -1 || keyword.indexOf("no-store") > -1){
    return null;
  }
  if(keyword.indexOf("must-revalidate") > -1 || keyword.indexOf("proxy-revalidate") > -1){
    return expiry; // Noop
  }
  if(keyword.indexOf("s-maxage") > -1){
    return expiry; // Noop
  }
  return expiry; // Unknown keyword, Noop
}

/**
 * Parse the data in the Expires header for information
 * returns Date object if the Expires header is valid
 * returns null if there is a valid Expires header that says not to cache
 * returns undefined if there is no valid Cache-Control header
 **/
function parseExpiresHeader(expiresHeader){
  if(expiresHeader === null || expiresHeader === undefined) {
    return undefined;
  }
  expires = new Date(expiresHeader);
  if(expires == "Invalid Date"){
    return null;
  }
  return expires;
}

/**
 * Nullify any invalid expiration Date objects (if they're in the past)
 **/
function nullifyInvalidExpiration(expiration){
  if(expiration instanceof Date && expiration < new Date()){
    return null;
  }
  return expiration;
}

/**
 * Returns the current time plus the given number of seconds into the future
 **/
function nowPlusSeconds(seconds){
  var now = new Date();
  now.setTime(now.getTime() + seconds * 1000);
  return now;
}

module.exports.getCacheExpiry = getCacheExpiry;
module.exports.nowPlusSeconds = nowPlusSeconds;
