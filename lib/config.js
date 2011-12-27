var yaml     = require('yaml').eval,
    readFile = require('fs').readFile,
    logging  = require('./logging'),
    path     = require('path'),
    dirname  = path.dirname,
    join     = path.join,
    server, report, userscripts;

var _filename = '.lowkick',
    cache = undefined;

function filename(newValue){
  if(arguments.length && _filename != newValue){
    _filename = newValue;
    cache = undefined;
    logging.info('Config filename has been set to "%s"', newValue);
  }

  return _filename;
}

function config(callback){
  if(cache!=undefined){
    callback(undefined, cache);
    return;
  }

  readFile(filename(), function(error, data){
    if(error){ 
      callback(error);
      return;
    }

    try { 
      cache = yaml(String(data));
      read();
    } catch(yamlParsingError) {
      callback(yamlParsingError);
      return;
    }

    callback(undefined, cache);
  });
};

function read(){
  if(cache==undefined){
    return;
  }

  logging.trace('Reading config...');

  report      = require('./report');
  server      = require('./server');
  userscripts = require('./userscripts');

  userscripts.filenames([]);

  cache.hasOwnProperty('target') && ( report.filename(join(dirname(filename()), cache.target)) );
  
  if(cache.hasOwnProperty('server')){
    cache.server.hasOwnProperty('port') && ( server.port(cache.server.port) );
    cache.server.hasOwnProperty('hostname') && ( server.hostname(cache.server.hostname) );
    cache.server.hasOwnProperty('host') && ( server.hostname(cache.server.host) );
  }

}

config.filename = filename;

module.exports = config;
