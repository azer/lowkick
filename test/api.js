var assert   = require('assert'),
    logging  = require('../lib/logging'),
    lowkick  = require('../lib/lowkick'),
    highkick = require('highkick'),
    revision = lowkick.revision,
    report   = lowkick.report;

function init(options, callback){
  callback(undefined, options.get, options.post);
}

function testSet(get, post, callback){
  post('set', { 'v8': true, 'node': true, 'ie': false }, function(error, response, body){
    if(error){ 
      logging.error(error);
      return callback(error);
    }

    lowkick.report.doc(undefined);

    report.results(function(error, results){
      if(error){ 
        callback(error);
        return;
      }

      //assert.ok(results.environ.v8);
      //assert.ok(results.environ.node);
      //assert.ok(!results.environ.ie);
      
      callback();
    });

  });
}

function testOk(get, post, callback){
  post('ok', { 'environ': ['node', 'v8'] }, function(error, response, body){
    if(error){ 
      logging.error(error);
      callback(error);
      return;
    }

    report.doc(undefined);

    report.results(function(error, results){
      if(error) return callback(error);

      assert.ok(results.environ.node);
      
      callback();
    });

  });
}

function testFail(get, post, callback){
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

function testResults(get, post, callback){
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

function testCommand(get, post, callback){
  highkick({ module:require('./command'), name:'API Commands', 'silent': false, 'ordered':true, 'get': get, 'post': post }, function(error, result){
    if(result.fail>0){
      callback(new Error('Command tests were failed.'));
      return;
    }

    callback();
  });
}

module.exports = {
  'init': init,
  'testSet': testSet,
  'testOk': testOk,
  'testFail': testFail,
  'testResults': testResults,
  'testCommand': testCommand
};
