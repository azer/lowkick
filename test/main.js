var assert        = require('assert'),
    highkick      = require('highkick'),
    fs            = require('fs'),
    mkdirp        = require('mkdirp'),
    rimraf        = require('rimraf'),

    exec          = require('child_process').exec,
    join          = require('path').join,


    lowkick       = require('../lib/lowkick'),
    config        = lowkick.config,
    report        = lowkick.report,
    userscripts   = lowkick.userscripts,
    revision      = lowkick.revision,
    verify        = lowkick.verify,

    writeFileSync = fs.writeFileSync,
    readFileSync  = fs.readFileSync;

var tmp = join(/*__dirname, '../', */'tmp');

function init(options, callback){
  config.filename('.example_config');
  callback();
}

function testConfig(callback){
  config.filename('.example_config');
  config(function(error, config){
    if(error) return callback(error);

    assert.equal(config.revision, '0.0.0');

    assert.equal(config.server.host, 'localhost');
    assert.equal(config.server.port, '8888');
    
    assert.equal(config.environ.length, 8);
    assert.equal(config.environ[0], 'Internet Explorer 9');
    assert.equal(config.environ[7], 'Opera 11');
    
    callback();
  });
}

function testGetRevision(callback){
  revision('');
  revision(function(rev){
    try {
      assert.equal(rev, '0.0.0');
    } catch(assertionError){
      return callback(assertionError);
    }
    
    config(function(err, configdoc){
      delete configdoc.revision;
      
      revision(function(rev){
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

    revision.gitDescription(function(error, rev){
      if(error && error.message != _error.message) return callback(error);
      assert.equal(rev, _stdout);
      callback();
    });
  });
}

function testReport(callback){
  highkick({ module:require('./report'), name:'report', 'silent':true, 'ordered':true }, function(error, result){
    if(result.fail>0){
      return callback(new Error('Report tests were failed.'));
    }

    callback();
  });
}

function testPackageVersion(callback){
  var _version = JSON.parse( readFileSync('./package.json') ).version;
  revision.packageVersion(function(error, version){
    if(error) return callback(error);
    assert.equal(_version, version);
    callback();
  });
}

function testVerify(callback){
  report.doc({
    'revision':'0.0.0',
    'environ':{
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

  revision('0.0.0');

  report.save(function(error){
    if(error) return callback(error);

    verify(function(error, results){
      if(error) return callback(error);

      try {
        assert.ok(results.ok);
        assert.ok(!results.fail);
        assert.equal(results.passed.length, 8);
        assert.equal(results.failed.length, 0);

        report.doc().revision = undefined;
      } catch(assertionError) {
        callback(assertionError);
      }

      verify(function(error, results){
        if(error) return callback(error);

        try {
          assert.ok(results.fail);
          assert.ok(!results.ok);

          assert.equal(results.passed.length, 0);
          assert.equal(results.failed.length, 0);

          report.doc().revision = '0.0.0';
          report.doc().environ['Internet Explorer 6'] = false;
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

function testUserScripts(callback){
  rimraf(tmp, {}, function(error){
    if(error) return callback(error);
  
    mkdirp.sync(tmp+'/1', 0755);
    mkdirp.sync(tmp+'/2', 0755);
    mkdirp.sync(tmp+'/2/3', 0755);

    writeFileSync(tmp+'/1/a.js', 'a');
    writeFileSync(tmp+'/1/b', 'b');
    writeFileSync(tmp+'/2/c', 'c');
    writeFileSync(tmp+'/2/3/d.js', 'd');
    writeFileSync(tmp+'/2/3/e.js', 'e');

    lowkick.userscripts(function(error, scripts){

      if(error) return callback(error);

      try {
        assert.arrayContent(scripts, [tmp+'/1/a.js', tmp+'/2/3/d.js', tmp+'/2/3/e.js']);
        callback();
      } catch(assertionError) {
        return callback(assertionError);
      }

    });

  });
}

module.exports = {
  'init': init,
  'testConfig': testConfig,
  'testGitDescription': testGitDescription,
  'testReport': testReport,
  'testVerify': testVerify,
  'testPackageVersion': testPackageVersion,
  'testGetRevision': testGetRevision,
  'testSetRevision': testSetRevision,
  'testUserScripts': testUserScripts
}
