var yaml     = require('yaml').eval,
    readFile = require('fs').readFile,
    logging  = require('./logging');

var _filename = '.lowkick',
    cache = undefined;

function filename(newValue){
  if(arguments.length){
    _filename = newValue;
    logging.info('Config filename has been set to "%s"', newValue);
  }

  return _filename;
}

function config(callback){
  if(cache!=undefined){
    return callback(undefined, cache);
  }

  readFile(filename(), function(error, data){
    if(error) return callback(error);

    try { 
      cache = yaml(String(data));
    } catch(yamlParsingError) {
      return callback(yamlParsingError);
    }

    return callback(undefined, cache);
  });
};

config.filename = filename;

module.exports = config;
