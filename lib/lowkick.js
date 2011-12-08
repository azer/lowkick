var http = require('http'),
    statik = require('node-static'),
    logging = require('./logging'),
    config = require('./config'),
    report = require('./report'),
    fs = require('fs'),
    exec = require('child_process').exec,
    undefined;

var revision = (function findRevision(){

  var value;

  return function(/* [newValue], callback */){
    var newValue = arguments.length == 2 ? arguments[0] : undefined,
        callback = arguments[ arguments.length - 1 ]; 

    newValue != undefined && ( value = newValue );

    if(value != undefined){
      logging.info('Returning revision value from cache; ', value);
      return callback(value);
    }

    gitDescription(function(error, gitRevNumber){
      if(!error){
        logging.info('Found git description for the project; ', gitRevNumber);
        return callback(undefined, gitRevNumber);
      }

      logging.warn('Failed to read git description. Trying package version...');

      packageVersion(function(error, pkgVer){
        if(!error){
          logging.info('Package version has been read to be used as revision number; ', pkgVer);
          return callback(pkgVer);
        }

        callback('0.0.0');
        
      });

    });

  }

})();

function gitDescription(callback){
  exec('git describe', function(error, stdout, stderr){
    !error && stderr && ( error = new Error(stderr) );
    callback(error, !error && stdout.replace(/[^\w\.-]+/g,''));
  });
}

function packageVersion(callback){
  fs.readFile('./package.json', function(error, bf){
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

function publish(options, callback){
  logging.info('Server starts on %s:%d', options.host, options.port);
  
  var file = new(statik.Server)('./public');

  http.createServer(function (request, response) {
    logging.info('New request to %s', request.path);
    request.addListener('end', function () {
      file.serve(request, response);
    });

    callback && callback();
  });
}

function verify(callback){
  logging.trace('Checking test logs...');
  
  revision(function(rev){
    
    config(function(error, config){

      report.results(function(error, results){
        if(error) return callback(error);

        var passed = [],
            failed = [],
            browser;

        if(results.revision == rev){
          for(browser in results.browsers){
            ( results.browsers[browser] ? passed : failed ).push(browser);
          }
        }

        var fail = failed.length > 0 || passed.length == 0,
            ok = !fail;

        callback(undefined, { 'passed':passed, 'failed':failed, 'ok':ok, 'fail':fail });
      });

    });

  });

}

function quiet(){
  logging.setLevel('ERROR');
}

module.exports = {
  'verify': verify,
  'publish': publish,
  'gitDescription': gitDescription,
  'packageVersion': packageVersion,
  'revision': revision,
  'quiet': quiet
}
