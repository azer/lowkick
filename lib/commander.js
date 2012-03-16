var drivers     = require('./drivers'),
    config      = require('./config'),
    logging     = require('./logging'),
    userscripts = require('./userscripts'),

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

function remote(commandName){
  logging.info('Running command "%s" in the remote server "%s"', commandName, config().remote);
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
