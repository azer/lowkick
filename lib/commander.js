var drivers     = require('./drivers'),
    config      = require('./config'),
    logging     = require('./logging'),
    userscripts = require('./userscripts'),
    report      = require('./report'),
    
    map         = require('functools').map,
    path        = require('path'),
    readFile    = require('fs').readFile,

    request     = require('request');

var commands = (function(){

  var value;

  return function commands(newValue){

    if(arguments.length > 0){
      value = newValue;
    };

    return value;
  };

})();

function recognize(commandName){
  return commands()[commandName];
}

function local(commandName, options, callback){
  logging.info('Running command "%s" in the local server', commandName);

  var command = recognize(commandName),
      driver;

  if(!command){
    callback(new Error('Unrecognized command "'+commandName+'"'));
    return;
  }

  driver = drivers.recognize(command.driver);

  if(!driver){
    callback(new Error('Unrecognized driver "'+command.driver+'"'));
    return;
  }

  logging.debug('Command "%s" is being executed by driver "%s"', commandName, command.driver);

  driver.run(command, options, callback);
}

function attachments(callback){
  userscripts(function(error, filenames){

    if(error){
      callback(error);
      return;
    }

    var len = filenames.length,
        attachments = [],
        filename;

    (function iter(i){

      if( i >= len ){

        callback(undefined, attachments);
        return;
      }

      filename = filenames[i];

      readFile(filename, function(error, bf){
        
        attachments.push({ name: path.basename(filename, '.js'), content: bf.toString() });

        iter(i+1);

      });

    })(0);

  });
}

function remote(commandName, options, callback){
  var conf = config();

  logging.info('Running command "%s" in the remote server "%s"', commandName, conf.remote);

  attachments(function(error, _attachments){

    if(error){
      callback(error);
      return;
    }

    var requestOptions = {
      'url': conf.remote + '/api/command/' + commandName,
      'method': 'POST',
      'body': { 
        'options': {
          'wait-end-signal': true,
          'attachments': _attachments
        }
      },
      'headers': {
        'Content-Type': 'application/json'
      }
    };

    logging.info( 'Calling remote command "%s" with following attachments "%s"', commandName, Object.keys( requestOptions.body.options.attachments ).join(', '));

    requestOptions.body = JSON.stringify(requestOptions.body);

    request(requestOptions, function(error, response, body){

      if(error){
        callback(error);
        return;
      }

      if( response.statusCode == 200 ){
        body = JSON.parse(body);
        
        logging.info('Got response from remote server.');
        logging.info('Sandbox: ', body.result.sandbox.name);
        logging.info('Signals: ', body.result.sandbox.signals.join(', '));
        logging.info('Messages: ', body.result.sandbox.messages.join(', '));

        report.setResult(body.result.sandbox.result, callback);
      }

    });

  });

}

function run(){
  var isRemoteCmd = config().hasOwnProperty('remote'); // FIX ME

  ( isRemoteCmd && remote || local ).apply(undefined, arguments);

}

module.exports = {
  'commands': commands,
  'recognize': recognize,
  'run': run
};
