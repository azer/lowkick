var logging  = require('./logging'),
    config   = require('./config'),
    exec     = require('child_process').exec,
    readFile = require('fs').readFile;

var _revision;

function revision(/* [newValue], callback */){

  var newValue = arguments.length == 2 || typeof arguments[0] == 'string' ? arguments[0] : undefined,
      callback = typeof arguments[ arguments.length - 1 ] == 'function' && arguments[ arguments.length - 1 ]; 

  newValue != undefined && ( _revision = newValue );

  if(!callback) return;

  if(_revision != undefined && _revision.length){
    logging.info('Returning revision value from cache; ', _revision);
    callback(_revision);
    return;
  }

  config(function(error, configdoc){

    if(!error && ( configdoc.hasOwnProperty('revision') || configdoc.hasOwnProperty('version')) ) { 
      return callback(configdoc['revision'] || configdoc['version']);
    }
    
    gitDescription(function(error, gitRevNumber){
      if(!error){
        logging.info('Found git description for the project; ', gitRevNumber);
        callback(undefined, gitRevNumber);
        return;
      }

      logging.warn('Failed to read git description. Trying package version...');

      packageVersion(function(error, pkgVer){
        if(!error){
          logging.info('Package version has been read to be used as revision number; ', pkgVer);
          callback(pkgVer);
          return;
        }

        callback('0.0.0');
        
      });

    });

  });

}

function gitDescription(callback){
  exec('git describe', function(error, stdout, stderr){
    !error && stderr && ( error = new Error(stderr) );
    callback(error, !error && stdout.replace(/[^\w\.-]+/g,''));
  });
}

function packageVersion(callback){
  readFile('./package.json', function(error, bf){
    if(error) return callback(error);
    
    var manifest;

    try {
      manifest = JSON.parse(bf.toString());
    } catch(jsonParsingError){
      return callback(jsonParsingError);
    }
    
    if(!manifest.hasOwnProperty('version')){
      callback(new Error('Package manifest does not contain any version field'));
    }

    return callback(undefined, manifest.version);
  });
}

module.exports = revision;
module.exports.gitDescription = gitDescription;
module.exports.packageVersion = packageVersion;
