var assert = require('assert'),
    highkick = require('highkick'),
    config = require('../lib/config'),
    report = require('../lib/report'),
    lowkick = require('../lib/lowkick'),
    readFileSync = require('fs').readFileSync,
    exec = require('child_process').exec;

function testConfig(callback){
  config.filename('.example_config');
  config(function(error, config){
    if(error) return callback(error);

    assert.equal(config.revision, '0.0.0');

    assert.equal(config.server.host, 'localhost');
    assert.equal(config.server.port, '8888');
    
    assert.equal(config.browsers.length, 8);
    assert.equal(config.browsers[0], 'Internet Explorer 9');
    assert.equal(config.browsers[7], 'Opera 11');
    
    callback();
  });
}

function testGetRevision(callback){
  lowkick.revision('');
  lowkick.revision(function(rev){
    try {
      assert.equal(rev, '0.0.0');
    } catch(assertionError){
      return callback(assertionError);
    }
    
    lowkick.config(function(err, configdoc){
      delete configdoc.revision;
      
      lowkick.revision(function(rev){
        try {
          assert.equal(rev, '0.0.1');
        } catch(assertionError){
          return callback(assertionError);
        }

        callback();
      });

    });

  });
}

function testSetRevision(callback){
  lowkick.revision('0.0.2', function(rev){
    assert.equal(rev, '0.0.2');
    callback();
  });
}

function testGitDescription(callback){
  exec('git describe', function(_error, _stdout, _stderr){
    !_error && _stderr && ( _error = new Error(_stderr) );

    lowkick.gitDescription(function(error, rev){
      if(error && error.message != _error.message) return callback(error);
      assert.equal(rev, _stdout);
      callback();
    });
  });
}

function testReport(callback){
  highkick({ module:require('./report'), name:'report', 'silent':true, 'ordered':true }, callback);
}

function testPackageVersion(callback){
  var _version = JSON.parse( readFileSync('./package.json') ).version;
  lowkick.packageVersion(function(error, version){
    if(error) return callback(error);
    assert.equal(_version, version);
    callback();
  });
}

function testVerify(callback){
  report.doc({
    'revision':'0.0.0',
    'browsers':{
      'Internet Explorer 6':true,
      'Internet Explorer 7':true,
      'Internet Explorer 8':true,
      'Internet Explorer 9':true,
      'Firefox 8':true,
      'Chrome 15':true,
      'Safari 3':true,
      'Opera 11':true
    }
  });

  lowkick.revision('0.0.0');

  report.save(function(error){
    if(error) return callback(error);
    
    lowkick.verify(function(error, results){
      if(error) return callback(error);

      try {
        assert.ok(results.ok);
        assert.ok(!results.fail);
        assert.equal(results.passed.length, 8);
        assert.equal(results.failed.length, 0);

        report.doc().revision = true;
      } catch(assertionError) {
        callback(assertionError);
      }

      lowkick.verify(function(error, results){
        if(error) return callback(error);

        try {
          assert.ok(results.fail);
          assert.ok(!results.ok);

          assert.equal(results.passed.length, 0);
          assert.equal(results.failed.length, 0);

          report.doc().revision = '0.0.0';
          report.doc().browsers['Internet Explorer 6'] = false;        
        } catch(assertionError) {
          callback(assertionError);
        }
        
        lowkick.verify(function(error, results){
          if(error) return callback(error);

          try {
            assert.equal(results.passed.length, 7);
            assert.equal(results.failed.length, 1);

            assert.equal(results.failed[0], 'Internet Explorer 6');
            assert.ok(results.fail);
          } catch(assertionError) {
            callback(assertionError);
          }
          
          callback();
        });

      });
    });
    
  });

}

module.exports = {
  'testConfig': testConfig,
  'testGitDescription': testGitDescription,
  'testReport': testReport,
  'testVerify': testVerify,
  'testPackageVersion': testPackageVersion,
  'testGetRevision': testGetRevision,
  'testSetRevision': testSetRevision
}