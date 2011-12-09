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

function fail(options, callback){
  setResult(options.browser, options.version, options.os, false, callback);
}

function filename(newValue){
  if(arguments.length){
    _filename = newValue;
    logging.info('Report filename has been set to "%s"', newValue);
  }

  return _filename;
}

function ok(options, callback){
  setResult(options.browser, options.version, options.os, true, callback);
}

function results(callback){
  if(_results != undefined) return callback(undefined, _results);

  exists(filename(), function(exists){
    if(!exists){
      logging.warn('Failed to read test results from specified filename "%s"', filename());

      _results = {};
      return callback(undefined, _results);
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
  _results = {};
  save(callback);
}

function setResult(browser, version, os, result, callback){
  logging.trace('setting test result for %s %s on %s to %s', browser, version, os, result);
  results(function(error, results){
    if(error) return callback(error);
    
    !results.hasOwnProperty(os) && ( results[os] = {} );
    !results[os].hasOwnProperty(browser) && ( results[os][browser] = {} );

    results[os][browser][version] = result;

    save(callback);
  });
}

function save(callback){
  results(function(error, results){
    if(error) return callback(error);

    logging.trace('Saving report to '+filename());
    fs.writeFile(filename(), JSON.stringify(results), callback);
  });
}

module.exports = {
  'doc':doc,
  'fail':fail,
  'filename':filename,
  'ok':ok,
  'reset':reset,
  'results':results,
  'save':save
};
