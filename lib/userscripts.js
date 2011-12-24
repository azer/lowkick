var logging   = require('./logging'),
    config    = require('./config'),
    combiner = require('combiner');

var filenames = [],
    readConfig = true;

function userscripts(callback){
  logging.trace('Gathering user scripts...');

  if(!readConfig){
    logging.info('Skipped reading config file. Returning existing filenames...');
    return callback(undefined, filenames);
  }

  config(function(error, configdoc){

    if(error){
      return callback(error);
    }

    readConfig = false;

    var i, scriptdirs;
    if(!configdoc.hasOwnProperty('scripts')){
      logging.info('Configuration doesnt contain any script files.');
      return callback(undefined, filenames);
    }

    combiner.includeDirectories(configdoc['scripts'], function(error, nestedScripts){
      if(error) return callback(error);

      combiner.flatten(nestedScripts, function(error, scripts){
        if(error) return callback(error);

        filenames.push.apply(filenames, scripts.filter(function(el){
          return el.substring(el.length-3) == '.js';
        }));

        callback(undefined, filenames);

      });
      
    });

  });

};

module.exports = userscripts;
