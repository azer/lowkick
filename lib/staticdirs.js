var join = require('path').join,
    wd   = require('./config').dirname;

var dirs = {};

function staticdirs(newValue){

  var uri, path;
  if( arguments.length > 0 ){

    for(uri in newValue){
      dirs[ join('/static', uri) ] = join( wd(), newValue[uri] );
    }

  }

  return dirs;
}

module.exports = staticdirs;
