var logging  = require('./logging'),
    exec     = require('child_process').exec,
    readFile = require('fs').readFile;

var _revision;

function revision(/* [newValue], callback */){

  var callback = typeof arguments[ arguments.length - 1 ] == 'function' && arguments[ arguments.length - 1 ]; 

  if(arguments.length == 2 || typeof arguments[0] != 'function'){
    logging.debug('Setting revision value to "%s" (arguments length: %d, typeof first argument: %s)', arguments[0], arguments.length, typeof arguments[0]);
    _revision = arguments[0];
    logging.info('Revision has been set to "%s"', _revision);
  }

  if(!callback) return _revision;

  if(_revision != undefined && _revision.length){
    logging.info('Returning revision value from cache; ', _revision);
    callback(_revision);
    return _revision;
  }


  require('./config')(function(error, configdoc){

    var configRev;

    if(!error && (configRev = configdoc.revision || configdoc.version)){
      logging.info('Returning revision "%s" from config document', configRev);
      callback(configRev);
      return;
    }

    gitDescription(function(error, gitRevNumber){
      if(!error){
        logging.info('Found git description for the project; ', gitRevNumber);
        callback(gitRevNumber);
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
