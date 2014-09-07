/**
 * Get the expiry time of an XMLHttpRequest response
 * This function will return a Date object for when the request expires
 **/

function getCacheExpiry(xhr){
  var expiresHeader = xhr.getResponseHeader('Expires');
  var cacheControlHeader = xhr.getResponseHeader('Cache-Control');
  if(cacheControlHeader !== null) {

  } else if(expiresHeader !== null) {
    expires = new Date(expiresHeader);
    if(expires == "Invalid Date"){
      return null;
    }
    return expires;
  } else {
    return null;
  }
}

module.exports.getCacheExpiry = getCacheExpiry;
