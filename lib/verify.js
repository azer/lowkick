var logging  = require('./logging'),
    revision = require('./revision'),
    report   = require('./report');

var environ = (function(){

  var value;

  return function environ(newValue){

    if(arguments.length > 0){
      value = newValue;
    }

    return value;
  };

})();

function verify(callback){
  logging.trace('Checking test logs...');
  
  revision(function(rev){
    
    logging.trace('Reading report results...');

    report.results(function(error, results){
      if(error) {
        callback(error);
        return;
      }

      logging.info('Got test results of revision#'+results.revision);

      var passed   = [],
          failed   = [],
          untested = [],
          targetEnviron = environ(),
          key, i;

      if(results.revision == rev){
        for(key in results.environ){
          ( results.environ[key] ? passed : failed ).push(key);
        }
      } else {
        logging.warn('Test results\' revision (%s) doesn\'t match the revision number (%s)', results.revision, rev);
      }

      i = targetEnviron.length;
      while(i-->0){
        key = targetEnviron[i];
        if(passed.indexOf(key) == -1 && failed.indexOf(key) == -1){
          untested.push(key);
        }
      }

      var fail = failed.length > 0 || passed.length == 0,
          ok = !fail;

      callback(undefined, { 'passed':passed, 'failed':failed, 'untested':untested, 'ok':ok, 'fail':fail, 'revision': rev });
    });

  });

}

module.exports = verify;
module.exports.environ = environ;
