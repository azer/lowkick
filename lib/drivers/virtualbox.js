var virtualbox = require('virtualbox'),
    logging    = require('../logging'),
    server     = require('../server');

function exec(vm, username, passwd, path, params, callback){
  virtualbox.start(vm, function(error){
    
    if(error){
      logging.error('Failed to start VM "%s"', vm);
      callback && callback(error);
      return;
    }

    logging.debug('Executing VirtualBox command on VM "%s". Username: %s Password: %s', vm, username, passwd);

    virtualbox.exec({ 'vm': vm, 'username': username, 'passwd': passwd, 'cmd': path, 'params': params }, function(error, stdout){

      if(error){
        logging.error(error);
      }

      callback && callback(error, stdout);
      
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
  var path            = cmd.path || cmd.exec || cmd.filename || cmd.run,
      vm              = cmd.vm || cmd.box || cmd.virtualMachine || cmd.machine || cmd.vmName || cmd.os,
      username        = cmd.username || cmd.user,
      passwd          = cmd.password || cmd.pass || cmd.passwd,
      params          = options.params || options.parameters || options.args,
      runServer       = options.hasOwnProperty('server') ? options.run : true,
      isServerRunning = server.isRunning(),

      run             = exec.bind(undefined, vm, username, passwd, path, params, callback);

  logging.info('Executing "%s" on VM "%s" with params', path, vm);
  logging.debug('Params:', params);

  if(!runServer || isServerRunning){
    run();
    return;
  }

  server.start(function(){

    require('../api').observeQuit(function(){
      stop(vm, callback);
    });

    run();

  });
  
}

module.exports = runVirtualBoxCommand;
