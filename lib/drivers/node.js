var exec    = require('child_process').exec,
    puts    = require('util').puts,
    logging = require('../logging');

function runNodeCommand(cmd, options, callback){
  logging.debug('Running a Node command "node %s"', cmd.script);
  exec('node '+cmd.script, function(error, stdout, stderr){
    !error && stderr && ( error = new Error(stderr) );
    puts(stdout || stderr);
    callback(error, { 'stdout': stdout, 'stderr': stderr });
  });
}

module.exports = runNodeCommand;
