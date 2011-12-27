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
            key, i;

        if(results.revision == rev){
          for(key in results.environ){
            ( results.environ[key] ? passed : failed ).push(key);
          }
        } else {
          logging.warn('Test results\' revision (%s) doesn\'t match the revision number (%s)', results.revision, rev);
        }

        i = config.environ.length;
        while(i-->0){
          key = config.environ[i];
          if(passed.indexOf(key) == -1 && failed.indexOf(key) == -1){
            untested.push(key);
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
