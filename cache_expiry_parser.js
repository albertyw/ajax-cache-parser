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
  }
  return expires;
}

module.exports.getCacheExpiry = getCacheExpiry;
