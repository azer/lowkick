var fs           = require('fs'),
    readFileSync = fs.readFileSync,

    exists       = require('path').existsSync,

    logging      = require('./logging'),
    path         = require('path'),
    dirname      = path.dirname,
    join         = path.join,
    
    verify, commander, revision, server, report, userscripts, staticdirs;

var _filename = '.lowkick',
    cache = undefined;

function filename(newValue){
  if(arguments.length && _filename != newValue){
    _filename = newValue;
    logging.info('Config filename has been set to "%s"', newValue);
    update();
  }

  return _filename;
}

function config(){
  return cache;
};

function dir(){
  return dirname(filename());
}

function update(){
  var fileExists = exists(_filename), 
      err;
  
  if(!fileExists && _filename != undefined){
    err = new Error('Couldn\'t find any file at "'+ _filename+'"');
    logging.fatal(err);
    throw err;
  } else if(!fileExists) {
    return;
  }

  cache = load();
  updateClients();
}

function has(prop){
  return cache && cache.hasOwnProperty(prop);
}

function load(){
  logging.debug('Loading configuration "%s"', filename());
  return parse(readFileSync(_filename).toString());
}

function parse(doc){
  return JSON.parse(doc);
}

function updateClients(){

  logging.trace('Updating config clients...');

  report      = require('./report');
  server      = require('./server');
  userscripts = require('./userscripts');
  commander   = require('./commander');
  revision    = require('./revision');
  verify      = require('./verify');
  staticdirs  = require('./staticdirs');

  verify.environ(cache.environ);

  has('scripts') && userscripts(cache.scripts.map(function(el){ return join(dir(), el); }));
  has('commands') && commander.commands(cache.commands);
  has('target') && ( report.filename(join(dirname(filename()), cache.target)) );
  has('logs') && ( logging.filename(join(dirname(filename()), cache.logs)) );
  has('static') && staticdirs(cache['static']);
  
  if(has('server')){
    logging.trace('Updating server settings. Hostname: %s Port: %s', ( cache.server.hostname || cache.server.host ), cache.server.port);
    cache.server.port && ( server.port(cache.server.port) );
    cache.server.hostname && ( server.hostname(cache.server.hostname) );
    cache.server.host && ( server.hostname(cache.server.host) );
  }

  var rev;
  ( rev = cache.revision || cache.version) && revision(rev);
}

module.exports = config;
module.exports.dirname = dir;
module.exports.filename = filename;
