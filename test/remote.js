var assert   = require('assert'),
    request  = require('request'),
    forever  = require('forever'),
    highkick = require('highkick'),
    join     = require('path').join,
    config   = require('../lib/config'),
    report   = require('../lib/report'),
    logging  = require('../lib/logging'),
    cli      = require('../lib/cli');

const CONN_TIMEOUT = 2000;

var serverProcess;

function init(options, callback){
  if(serverProcess){
    callback(undefined);
    return;
  }
  
  config.filename('test/remote-client-config.json');

  var configdoc = config();

  report.reset(function(error){

    if(error){
      logging.error('Failed to reset report document.');
      logging.error(error);

      return;
    }
  
    serverProcess = forever.start(['./bin/lowkick', 'publish', 'test/remote-server-config.json'], {
      silent: true
    });

    serverProcess.on('start', function(process, data){

      var url = configdoc.remote,
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

          callback(undefined);
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

module.exports = {
  'init': init,
  'end': end
};
