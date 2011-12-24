var logging = require('./logging'),
    revision = require('./revision'),
    config = require('./config'),
    report = require('./report');

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
            environ;

        if(results.revision == rev){
          for(environ in results.environ){
            ( results.environ[environ] ? passed : failed ).push(environ);
          }
        } else {
          logging.warn('Test results\' revision (%s) doesn\'t match the revision number (%s)', results.revision, rev);
        }

        for(environ in results.environs){
          if(passed.indexOf(environ) == -1 && failed.indexOf(environ) == -1){
            untested.push(environ);
          }
        }

        var fail = failed.length > 0 || passed.length == 0,
            ok = !fail;

        callback(undefined, { 'passed':passed, 'failed':failed, 'untested':untested, 'ok':ok, 'fail':fail, 'revision': rev });
      });

    });

  });
}

module.exports = verify;
