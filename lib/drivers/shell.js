var exec = require('child_process').exec,
    logging    = require('../logging');

function run(def, options, callback){
  var cmd = def.cmd || def.command || def.run || options.cmd || options.command || options.run;

  logging.info('Running shell command "%s"', cmd);

  exec(cmd, function(error, stdout, stderr){
    if(error){
      callback(error);
      return;
    }

    callback(undefined, { 'stdout': stdout, 'stderr': stderr });

  });

}

module.exports = run;
