var assert = require('assert'),
    config = require('../lib/config'),
    report = require('../lib/report'),
    fs     = require('fs'),
    exists = require('path').existsSync;

function init(options, callback){
  report.reset(callback);
}

function testSave(callback){
  report.results(function(error, results){
    if(error) return callback(error);

    results['foo'] = true;
    
    report.save(function(error){
      if(error) return callback(error);
      
      assert.ok( JSON.parse(fs.readFileSync(report.filename())).foo );
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
  report.ok({ 'browser':'Firefox', 'version':9, 'os':'Linux' }, function(error){
    if(error) return callback(error);
    
    report.results(function(error, results){
      if(callback) return callback(error);

      assert.ok(results.Linux.Firefox['9']);
      callback();
    });
    
  });
}

function testReset(callback){
  report.reset(function(){
    assert.equal(fs.readFileSync(report.filename()).toString(), '{}');
    callback();
  });
}

function testFail(callback){
  report.fail({ 'browser':'Firefox', 'version':9, 'os':'Linux' }, function(error){
    if(error) return callback(error);
    
    report.results(function(error, results){
      if(callback) return callback(error);

      assert.ok(!results.Linux.Firefox['9']);
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
  'testDoc':testDoc,
  'testSave':testSave,
  'testFail':testFail,
  'testOK':testOK,
  'testReset':testReset,
  'testResults':testResults
}
