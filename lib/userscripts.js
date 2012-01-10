var logging  = require('./logging'),
    config   = require('./config'),
    combiner = require('combiner'),
    path     = require('path'),
    join     = path.join,
    dirname  = path.dirname;

var _filenames = [],
    _findFiles = false;

function filenames(/* newValue, callback */){
  var newValue, 
      callback = arguments[ arguments.length - 1 ];

  typeof callback != 'function' && ( callback = undefined );

  if(arguments.length == 2 || typeof arguments[0] != 'function'){
    _filenames = arguments[0];
    _findFiles = true;
  }

  if(!callback) {
    return;
  }

  if(!_findFiles || !_filenames){
    callback(undefined, _filenames);
    return;
  }

  _findFiles = false;

  find(_filenames, function(error, result){
    _filenames = result;
    callback(error, _filenames);
  });

}

function find(paths, callback){
  var files = paths.map(function(el){
    return join(dirname(config.filename()), el);
  });

  var result = [];

  combiner.includeDirectories(files, function(error, nestedFiles){
    if(error) {
      callback(error);
      return;
	  }

    combiner.flatten(nestedFiles, function(error, scripts){
      if(error) { 
        callback(error);
        return;
	    }

      result.push.apply(result, scripts.filter(function(el){
        return el.substring(el.length-3) == '.js';
      }));

      callback(undefined, result);

    });
    
  });

}

module.exports = filenames;


