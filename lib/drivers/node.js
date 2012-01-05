var exec = require('child_process').exec,
    logging = require('../logging');

function runNodeCommand(cmd, options, callback){
  logging.debug('Running a Node command "node %s"', cmd.script);
  exec('node '+cmd.script, function(error, stdout, stderr){
    !error && stderr && ( error = new Error(stderr) );

    callback(error, { 'stdout': stdout });
  });
}

module.exports = runNodeCommand;