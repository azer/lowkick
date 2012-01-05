var drivers = require('./drivers');

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
    callback(new Error('Unrecognized driver "'+driver+'"'));
    return;
  }
  
  driver.run(command, options, callback);
}

module.exports = {
  'commands': commands,
  'recognize': recognize,
  'run': run
};
