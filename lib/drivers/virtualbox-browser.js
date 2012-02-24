var virtualbox = require('./virtualbox'),
    sandbox    = require('../sandbox');

function vboxBrowser(cmd, options, callback){
  
  sandbox.construct(options, function(error, sbox){

    if(error){
      callback(error);
      return;
    }

    options.params = ( cmd.url || cmd.link || cmd.open || cmd.target || cmd.browse )  + '?params=' + encodeURI(JSON.stringify({ 'driver': options.driverName, 'sandbox': sbox.name })).replace(/\%/g, '_');

    virtualbox(cmd, options, function(error){
      callback(error, { 'sandbox': sbox });
    });

  });
}

module.exports = vboxBrowser;
