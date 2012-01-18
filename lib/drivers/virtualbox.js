var virtualbox = require('virtualbox'),
    logging    = require('../logging'),
    server     = require('../server');

function exec(vm, path, params, callback){
  virtualbox.start(vm, function(error){
    
    if(error){
      logging.error('Failed to start VM "%s"', vm);
      callback && callback(error);
      return;
    }

    virtualbox.exec({ 'vm': vm, 'cmd': path, 'params': params }, function(error, stdout){

      if(error){
        logging.error(error);
      }

      callback && callback(error);
      
    });

  });  
}

function stop(vm, callback){
  virtualbox.stop(vm, function(vmError){
    if(vmError) {
      logging.error('Failed to stop VM "%s"', vm);
      callback(vmError);
      return;
    }

    server.stop();

    callback();
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
    exec(vm, path, params, callback);
    return;
  }

  server.start(function(){

    require('../api').observeQuit(function(){
      stop(vm, callback);
    });

    exec(vm, path, params);

  });
  
}

module.exports = runVirtualBoxCommand;
