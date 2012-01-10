var logging  = require('./logging'),
    config   = require('./config'),
    combiner = require('combiner'),
    path     = require('path'),
    join     = path.join,
    dirname  = path.dirname;

var _filenames = [],
    _findFiles = false;

function filenames(/* newValue, callback */){
  var callback = arguments[ arguments.length - 1 ],
      newValue;

  typeof callback != 'function' && ( callback = undefined );

  if(arguments.length == 2 || typeof arguments[0] != 'function'){
    newValue = arguments[0];

    logging.debug('Setting userscripts to ', newValue);

    _filenames = newValue;
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

function find(targets, callback){
  logging.trace('Finding user scripts under following targets; ', targets);

  var result = [];

  combiner.includeDirectories(targets, function(error, tree){
    if(error) {
      callback(error);
      return;
	  }

    combiner.flatten(tree, function(error, files){
      if(error) { 
        callback(error);
        return;
	    }

      result.push.apply(result, files.filter(function(el){
        return el.substring(el.length-3) == '.js';
      }));

      logging.info('Found user scripts;', result);

      callback(undefined, result);

    });
    
  });

}

module.exports = filenames;


