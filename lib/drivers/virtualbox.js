var virtualbox = require('virtualbox'),
    logging    = require('./logging');

function runVirtualBoxCommand(cmd, options, callback){
  var path = cmd.path || cmd.exec || cmd.filename || cmd.run,
      vm = cmd.vm || cmd.box || cmd.virtualMachine || cmd.machine || cmd.vmName || cmd.os;

  logging.debug('Executing "%s" on VM "%s"', path, vm);

  virtualbox.start({ 'vm': vm, 'cmd': path }, function(error){
    
    if(error){
      logging.error('Failed to start VM "%s"', vm);
      callback(error);
      return;
    }

    virtualbox.exec(path, function(error, stdout, stderr){
      !error && stderr && ( error = new Error(stderr) );

      callback(error);
    });

  });
  
}

module.exports = runVirtualBoxCommand;
