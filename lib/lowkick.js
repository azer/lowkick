var http      = require('http'),
    statik    = require('node-static'),
    logging   = require('./logging'),
    config    = require('./config'),
    report    = require('./report'),
    fs        = require('fs'),
    exec      = require('child_process').exec,
    combiner  = require('combiner'),
    functools = require('functools'),
    undefined;

var userscripts = (function(){
  
  var filenames = [],
      readConfig = true;

  return function userscripts(callback){
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

})();

var revision = (function findRevision(){

  var value;

  return function(/* [newValue], callback */){
    var newValue = arguments.length == 2 || typeof arguments[0] == 'string' ? arguments[0] : undefined,
        callback = typeof arguments[ arguments.length - 1 ] == 'function' && arguments[ arguments.length - 1 ]; 

    newValue != undefined && ( value = newValue );

    if(!callback) return;

    if(value != undefined && value.length){
      logging.info('Returning revision value from cache; ', value);
      return callback(value);
    }

    config(function(error, configdoc){

      if(!error && ( configdoc.hasOwnProperty('revision') || configdoc.hasOwnProperty('version')) ) { 
        return callback(configdoc['revision'] || configdoc['version']);
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

      logging.trace('Reading report results...');

      report.results(function(error, results){
        if(error) return callback(error);

        logging.info('Got test results of revision#'+results.revision);

        var passed   = [],
            failed   = [],
            untested = [],
            browser;

        if(results.revision == rev){
          for(browser in results.browsers){
            ( results.browsers[browser] ? passed : failed ).push(browser);
          }
        } else {
          logging.warn('Test results\' revision (%s) doesn\'t match the revision number (%s)', results.revision, rev);
        }

        for(browser in results.browsers){
          if(passed.indexOf(browser) == -1 && failed.indexOf(browser) == -1){
            untested.push(browser);
          }
        }

        var fail = failed.length > 0 || passed.length == 0,
            ok = !fail;

        callback(undefined, { 'passed':passed, 'failed':failed, 'untested':untested, 'ok':ok, 'fail':fail, 'revision': rev });
      });

    });

  });
}

function quiet(){
  logging.setLevel('ERROR');
}

function verbose(){
  logging.setLevel('TRACE');
}

module.exports = {
  'config': config,
  'gitDescription': gitDescription,
  'logging': logging,
  'packageVersion': packageVersion,
  'publish': publish,
  'revision': revision,
  'report': report,
  'quiet': quiet,
  'userscripts': userscripts,
  'verbose': verbose,
  'verify': verify
}
