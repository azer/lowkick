var virtualbox = require('virtualbox'),
    logging    = require('../logging'),
    server     = require('../server');

function start(vm, path, params, callback){
  virtualbox.start(vm, function(error){
    
    if(error){
      logging.error('Failed to start VM "%s"', vm);
      callback(error);
      return;
    }

    virtualbox.exec({ 'vm': vm, 'cmd': path, 'params': params }, function(error, stdout, stderr){
      !error && stderr && ( error = new Error(stderr) );

      callback(error);
      
      /* FIX ME
      virtualbox.stop(vm, function(stopError){
        !error && stopError && ( error = stopError );
        callback(error);
      });*/
    });

  });  
}

function runVirtualBoxCommand(cmd, options, callback){
  var path = cmd.path || cmd.exec || cmd.filename || cmd.run,
      vm = cmd.vm || cmd.box || cmd.virtualMachine || cmd.machine || cmd.vmName || cmd.os,
      params = options.params || options.parameters || options.args,
      runServer = options.hasOwnProperty('server') ? options.run : true;

  logging.info('Executing "%s" on VM "%s" with params', path, vm);
  logging.debug('Params:', params);

  if(!runServer){
    start(vm, path, params, callback);
    return;
  }

  console.log(server);

  server.start(function(){

    start(vm, path, params, function(error){
      //server.stop();
      //      callback(error);
    });

  });
  
}

module.exports = runVirtualBoxCommand;
