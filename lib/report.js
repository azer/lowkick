var fs      = require('fs'),
    exists  = require('path').exists,
    logging = require('./logging');

var _filename = 'lowkick-test-results.json',
    _results = undefined;

function doc(newValue){
  if(arguments.length){
    _results = newValue;
  }

  return _results;
}

function fail(environmentNames, callback){
  var envset = {};

  var i = environmentNames.length;
  while(i-->0){
    envset[ environmentNames[i] ] = false;
  }

  setResult(envset, callback);
}

function filename(newValue){
  if(arguments.length && newValue != _filename){
    _filename = newValue;
    _results = undefined;
    logging.info('Report filename has been set to "%s"', newValue);
  }

  return _filename;
}

function ok(environmentNames, callback){
  var envset = {};

  var i = environmentNames.length;
  while(i-->0){
    envset[ environmentNames[i] ] = true;
  }

  setResult(envset, callback);
}

function results(callback){
  if(_results != undefined){ 
    callback(undefined, _results);
    return;
  }

  exists(filename(), function(exists){
    if(!exists){
      logging.warn('Failed to read test results from specified filename "%s"', filename());

      reset(function(error, newdoc){
        if(error){
          return callback(error);
        }
        callback(undefined, newdoc);
      });

      return;
    }

    logging.trace('Reading report from '+filename());
    fs.readFile(filename(), function(error, reportContent){
      if(error) return callback(error);
      
      try {
        _results = JSON.parse(String(reportContent));
      } catch(JSONParsingError){
        return callback(JSONParsingError);
      }

      return callback(undefined, _results);

    });
  });
}

function reset(callback){
  _results = { 'environ':{} };
  require('./lowkick').revision(function(rev){
    _results['revision'] = rev;
    save(function(error){
      callback(error, _results);
    });
  });
}

function setResult(environments, callback){
  if(typeof environments != 'object'){
    return callback(new Error('Environments must be defined in an object.'));
  }

  logging.trace('Getting results doc to set new result.');

  results(function(error, results){
    if(error) return callback(error);

    var key;
    for(key in environments){
      logging.trace('Setting new environment result: %s => %s', key, environments[key]);
      results.environ[key] = environments[key];
    }
    
    save(callback);
  });
}

function save(callback){
  results(function(error, results){
    if(error) return callback(error);

    logging.trace('Saving report to '+filename());
    fs.writeFile(filename(), JSON.stringify(results, null, 4), callback);
  });
}

module.exports = {
  'doc':doc,
  'fail':fail,
  'filename':filename,
  'ok':ok,
  'reset':reset,
  'results':results,
  'setResult': setResult,
  'save':save
};
