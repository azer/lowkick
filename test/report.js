var assert  = require('assert'),

    lowkick = require('../lib/lowkick'),
    report  = lowkick.report,

    fs      = require('fs'),
    path    = require('path'),
    exists  = path.existsSync,
    join    = path.join,
    dirname = path.dirname;

function init(options, callback){
  report.reset(function(){
    callback();
  });
}

function testFilename(callback){
  assert.equal('test/tmp-results.json', report.filename());
  callback();
}

function testSave(callback){
  report.results(function(error, results){
    if(error) return callback(error);

    results['foo'] = true;
    
    report.save(function(error){
      if(error){ 
        callback(error);
        return;
      }

      var doc; 

      try {
        doc = JSON.parse(fs.readFileSync(report.filename()))
      } catch(jsonParsingError){
        callback(jsonParsingError);
        return;
      }

      callback();
    });
  });
}

function testResults(callback){
  report.results(function(error, results){
    if(error) return callback(error);

    assert.ok(results);

    callback();
  });
}

function testOK(callback){
  report.ok(['linux', 'firefox'], function(error){
    if(error) return callback(error);
    
    report.results(function(error, results){
      if(callback) return callback(error);

      assert.ok(results.environ.linux);
      assert.ok(results.environ.firefox);
      callback();
    });
    
  });
}

function testSetResult(callback){
  report.setResult(['chrome', 'v8', 'osx'], function(error){
    if(error) return callback(error);

    report.results(function(error, results){
      if(callback) return callback(error);

      assert.ok(results.environ.chrome);
      assert.ok(results.environ.v8);
      assert.ok(results.environ.osx);
      callback();
    });
    
  });
}

function testReset(callback){
  lowkick.revision(function(revision){
    report.reset(function(){
      var doc = fs.readFileSync(report.filename()).toString().replace(/(\n|\s)+/g,' '),
          equalTo = '{ "revision": "'+revision+'", "environ": {} }',
          orEqualTo = '{ "environ": {}, "revision": "'+revision+'" }';

      assert.ok(doc == equalTo || doc == orEqualTo );
      callback();
    });

  });
}

function testFail(callback){
  report.fail(['node', 'v8'], function(error){
    if(error) return callback(error);
    
    report.results(function(error, results){
      if(callback) return callback(error);

      assert.ok(!results.environ.node);
      assert.ok(!results.environ.v8);

      callback();
    });
    
  });
}

function testDoc(callback){
  report.doc({ 'qux':'foo' });
  assert.equal(report.doc().qux, 'foo');
  callback();
}

module.exports = {
  'init': init,
  'testFilename': testFilename,
  'testDoc': testDoc,
  'testSave': testSave,
  'testFail': testFail,
  'testOK': testOK,
  'testSetResult': testSetResult,
  'testReset': testReset,
  'testResults': testResults
}
