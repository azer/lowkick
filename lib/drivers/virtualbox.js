var virtualbox = require('virtualbox'),
    logging    = require('../logging');

function runVirtualBoxCommand(cmd, options, callback){
  var path = cmd.path || cmd.exec || cmd.filename || cmd.run,
      vm = cmd.vm || cmd.box || cmd.virtualMachine || cmd.machine || cmd.vmName || cmd.os,
      params = options.params || options.parameters || options.args;

  logging.info('Executing "%s" on VM "%s" with params', path, vm);
  logging.debug('Params:', params);

  virtualbox.start(vm, function(error){
    
    if(error){
      logging.error('Failed to start VM "%s"', vm);
      callback(error);
      return;
    }

    virtualbox.exec({ 'vm': vm, 'cmd': path, 'params': params }, function(error, stdout, stderr){
      !error && stderr && ( error = new Error(stderr) );

      callback(error);
    });

  });
  
}

module.exports = runVirtualBoxCommand;
