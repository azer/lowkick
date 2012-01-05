var assert   = require('assert'),
    request  = require('request'),
    forever  = require('forever'),
    join     = require('path').join,
    config   = require('../lib/config'),
    report   = require('../lib/report'),
    logging  = require('../lib/logging'),
    revision = require('../lib/revision');

const CONN_TIMEOUT = 2000;

var process;

function init(options, callback){
  if(process){
    callback();
    return;
  }

  config.filename('test/tmp-config.json');

  report.reset(function(error){

    if(error){
      logging.error('Failed to reset report document.');
      logging.error(error);

      return;
    }
  
    process = forever.start(['./bin/lowkick', 'publish', 'test/tmp-config.json'], {
      silent: true
    });

    process.on('start', function(process, data){

      config(function(error, configdoc){
        if(error){
          callback(error);
          return;
        }

        var url = 'http://' + configdoc.server.host + ':' + configdoc.server.port,
            startTS = +(new Date);

        (function waitServerToStart(){
          request.get(url, function(error){
            if(error && +(new Date)-startTS<CONN_TIMEOUT) {
              setTimeout(waitServerToStart, 100);
              return;
            } else if(error){
              callback(new Error('Connection timeout. ('+(+(new Date)-startTS)+' ms)'));
              return;
            }

            callback();
          });
        })();

      });
    });

  });
}

function end(callback){
  try {
    process.stop();
    callback();
  } catch(err) {
    callback(err);
  }
}

function get(path, callback){

  config(function(error, configdoc){
    if(error){ 
      callback(error);
      return;
    }

    request.get({
      'headers': { 'content-type' : 'application/json' },
      'url': 'http://' + join(configdoc.server.host+':'+configdoc.server.port, 'api', path)
    }, callback);

  });
}

function post(path, body, callback){

  config(function(error, configdoc){
    if(error) {
      callback(error);
      return;
    }

    request.post({
      'headers': { 'content-type' : 'application/json' },
      'url': 'http://' + join(configdoc.server.host+':'+configdoc.server.port, 'api', path),
      'body': JSON.stringify(body)
    }, callback);


  });
}


function testSet(callback){
  post('set', { 'v8': true, 'node': true, 'ie': false }, function(error, response, body){
    if(error){ 
      logging.error(error);
      return callback(error);
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error){ 
        callback(error);
        return;
      }

      assert.ok(results.environ.v8);
      assert.ok(results.environ.node);
      assert.ok(!results.environ.ie);
      
      callback();
    });

  });
}

function testOk(callback){
  post('ok', { 'environ': ['node', 'v8'] }, function(error, response, body){
    if(error){ 
      logging.error(error);
      callback(error);
      return;
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error) return callback(error);

      assert.ok(results.environ.v8);
      assert.ok(results.environ.node);
      
      callback();
    });

  });
}

function testFail(callback){
  post('fail', { 'environ': ['ie6', 'ie7', 'ie8'] }, function(error, response, body){
    if(error){ 
      logging.error(error);
      callback(error);
      return;
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error) {
        callback(error);
        return;
      }

      assert.equal(results.environ.ie8, false);
      assert.equal(results.environ.ie7, false);
      assert.equal(results.environ.ie6, false);
      
      callback();
    });

  });
}

function testResults(callback){
  post('ok', { 'environ': ['node', 'v8'] }, function(error, response, body){
    if(error){ 
      logging.error(error);
      callback(error);
      return;
    }

    body = JSON.parse(body);

    get('results', function(error, response, body){

      if(error){
        logging.error(error);
        callback(error);
        return;
      }

      body = JSON.parse(body);

      try {

        assert.ok(body.environ.node);
        assert.ok(body.environ.v8);

      } catch(assertionError){
        callback(assertionError);
        return;
      }

      revision(function(rev){
        assert.equal(rev, body.revision);
        callback();
      });

    });

  });
}

module.exports = {
  'init': init,
  'end': end,
  'testSet': testSet,
  'testOk': testOk,
  'testFail': testFail,
  'testResults': testResults
};
