var drivers = require('./drivers'),
    logging = require('./logging');

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

function run(commandName, options, callback){
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

module.exports = {
  'commands': commands,
  'recognize': recognize,
  'run': run
};
