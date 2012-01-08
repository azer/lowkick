var assert   = require('assert'),
    request  = require('request'),
    forever  = require('forever'),
    highkick = require('highkick'),
    join     = require('path').join,
    config   = require('../lib/config'),
    report   = require('../lib/report'),
    logging  = require('../lib/logging');

const CONN_TIMEOUT = 2000;

var serverProcess;

function init(options, callback){
  if(serverProcess){
    callback(undefined, get, post);
    return;
  }

  config.filename('test/tmp-config.json');
  var configdoc = config();

  report.reset(function(error){

    if(error){
      logging.error('Failed to reset report document.');
      logging.error(error);

      return;
    }
  
    serverProcess = forever.start(['./bin/lowkick', 'publish', 'test/tmp-config.json'], {
      silent: true
    });

    serverProcess.on('start', function(process, data){

      var url = 'http://' + configdoc.server.host + ':' + configdoc.server.port,
          startTS = +(new Date);

      (function waitServerToStart(){
        
        request.get(url, function(error){

          if(error && +(new Date)-startTS<CONN_TIMEOUT) {
            setTimeout(waitServerToStart, 100);
            return;
          } else if(error){
            end(function(){
              callback(new Error('Connection timeout. ('+(+(new Date)-startTS)+' ms)'));
            });
            return;
          }

          callback(undefined, get, post);
        });

      })();

    });

  });
}

function end(callback){
  if(!serverProcess){
    logging.warn('Server is already not running');
    callback();
    return;
  }

  try {
    serverProcess.stop();
    callback();
  } catch(err) {
    callback(err);
  }
}


function get(path, callback){
  var configdoc = config();

  request.get({
    'headers': { 'content-type' : 'application/json' },
    'url': 'http://' + join(configdoc.server.host+':'+configdoc.server.port, 'api', path)
  }, callback);
}

function post(path, body, callback){
  var configdoc = config();
  request.post({
    'headers': { 'content-type' : 'application/json' },
    'url': 'http://' + join(configdoc.server.host+':'+configdoc.server.port, 'api', path),
    'body': JSON.stringify(body)
  }, callback);
}

function testAPI(get, post, callback){
  highkick({ module:require('./api'), name:'API', 'silent':true, 'ordered':true, 'get': get, 'post': post }, function(error, result){
    if(result.fail>0){
      callback(new Error('API tests were failed.'));
      return;
    }

    callback();
  });
}

module.exports = {
  'init': init,
  'end': end,
  'testAPI': testAPI
};
