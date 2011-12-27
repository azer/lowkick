var logging  = require('./logging'),
    config   = require('./config'),
    combiner = require('combiner'),
    path     = require('path'),
    join     = path.join,
    dirname  = path.dirname;

var _filenames = [],
    readConfig = true;

function filenames(newValue){
  if(arguments.length>0){
    _filenames = newValue;
  }

  return _filenames;
}

function userscripts(callback){
  logging.trace('Gathering user scripts...');

  if(!readConfig){
    logging.info('Skipped reading config file. Returning existing filenames...');
    return callback(undefined, _filenames);
  }

  config(function(error, configdoc){

    if(error){
      return callback(error);
    }

    readConfig = false;

    var i, scriptdirs;

    if(!configdoc.hasOwnProperty('scripts')){
      logging.info('Configuration doesnt contain any script files.');
      return callback(undefined, _filenames);
    }

    scriptdirs = configdoc['scripts'].map(function(el){
      return join(dirname(config.filename()), el);
    });

    combiner.includeDirectories(scriptdirs, function(error, nestedScripts){
      if(error) return callback(error);

      combiner.flatten(nestedScripts, function(error, scripts){
        if(error) return callback(error);

        _filenames.push.apply(_filenames, scripts.filter(function(el){
          return el.substring(el.length-3) == '.js';
        }));

        callback(undefined, _filenames);

      });
      
    });

  });

};

module.exports = userscripts;
module.exports.filenames = filenames;
