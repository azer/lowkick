var exec    = require('child_process').exec,
    puts    = require('util').puts,
    logging = require('../logging');

function runNodeCommand(cmd, options, callback){
  var script = cmd.script || options.attachments.paths.join(' ');

  logging.debug('Running a Node command "node %s"', script);
  exec('node '+script, function(error, stdout, stderr){
    !error && stderr && ( error = new Error(stderr) );
    puts(stdout || stderr);
    callback(error, { 'stdout': stdout, 'stderr': stderr });
  });
}

module.exports = runNodeCommand;
