var assert   = require('assert'),
    request  = require('request'),
    forever  = require('forever'),
    join     = require('path').join,
    config   = require('../lib/config'),
    report   = require('../lib/report'),
    logging  = require('../lib/logging'),
    revision = require('../lib/revision');
    

var process;

function init(options, callback){
  if(process){
    process.stop();
  }

  config.filename('test/.config');

  report.reset(function(error){

    if(error){
      logging.error('Failed to reset report document.');
      logging.error(error);

      return;
    }
  
    process = forever.start(['./bin/lowkick', 'publish', 'test/.config'], {
      silent: true
    });


    process.on('start', function(process, data){

      config(function(error, configdoc){
        if(error) return callback(error);

        var url = 'http://' + configdoc.server.host + ':' + configdoc.server.port;

        (function waitServerToStart(){
          request.get(url, function(error){
            if(error) {
              setTimeout(waitServerToStart, 100); 
              return;
            }

            callback();
          });
        })();

      });
    });

  });
}

function post(path, body, callback){

  config(function(error, configdoc){
    if(error) return callback(error);

    request.post({
      'headers': { 'content-type' : 'application/json' },
      'url': 'http://' + join(configdoc.server.host+':'+configdoc.server.port, 'api', path),
      'body': JSON.stringify(body)
    }, callback);


  });
}

function end(callback){
  process.stop();
  callback();
}

function testSet(callback){
  post('set', { 'v8': true, 'node': true, 'ie': false }, function(error, response, body){
    if(error){ 
      logging.error(error);
      return callback(error);
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error) return callback(error);

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
      return callback(error);
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
      return callback(error);
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error) return callback(error);

      assert.equal(results.environ.ie8, false);
      assert.equal(results.environ.ie7, false);
      assert.equal(results.environ.ie6, false);
      
      callback();
    });

  });
}

module.exports = {
  'init': init,
  'end': end,
  'testSet': testSet,
  'testOk': testOk,
  'testFail': testFail
};
