var request = require('request'),

    logging = require('./logging'),

    stdin   = process.stdin,
    stdout  = process.stdout,

    PROMPT  = '> ';

function evalScript(options, callback){

  var reqoptions = { 
      'url': options.server + 'api/sandbox/' + options.sandbox + '/io',
      'method': 'POST',
      'body': {
        'script': options.script
      },
      'headers': {
        'Content-Type': 'application/json'
      }
    };

  reqoptions.body = JSON.stringify( reqoptions.body );

  request(reqoptions, function(error, response, body){
    var output;
    
    if(error){
      callback(error);
      return;
    }

    if( response.statusCode == 200 ){
      body = JSON.parse(body);

      if(!body.entry){
        evalScript(options, callback);
        return;
      }

      output = body.entry.output;
      typeof output == 'object' && ( output = JSON.stringify(output) );

      callback(undefined, output);
    }

  });

}

function sandboxName(server, command, callback){
  logging.info('Initializing sandbox...');

  var options = { 
    'method': 'POST', 
    'url': server + 'api/command/' + command, 
    body: {
      'wait-end-signal': true,
      'js': 'lowkick.io.subscribe(); lowkick.signal("end");'
    }, 
    headers: { 
      'Content-Type': 'application/json' 
    } 
  };

  options.body = JSON.stringify( options.body );

  request(options, function(error, response, body){

    if(error){
      callback(error);
      return;
    }

    if( response.statusCode == 200 ){
      body = JSON.parse(body);
      callback(undefined, body.result.sandbox.name);
    }

  });
}

function loop(server, commandName){

  server[ server.length - 1 ] != '/' && ( server += '/' );

  logging.info('Starting JavaScript console upon %s@%s', commandName, server);

  sandboxName(server, commandName, function(error, sboxName){

    if(error){
      logging.fatal(error);
      return;
    }

    if(!sboxName){
      logging.error('Unexpected sandbox initialization error. Invalid sandbox name: %s', sboxName);
      return;
    }

    (function prompt(){

      stdin.resume();
      
      stdout.write(PROMPT);

      stdin.once('data', function(data){

        var script = data.toString().trim();

        if(!script){
          prompt();
          return;
        }

        evalScript({ 'script': script, 'sandbox': sboxName, 'server': server }, function(error, output){

          if(error){
            logging.error(error);
          } else {
            process.stdout.write(output + '\n');
          };

          prompt();

        });
                   
      });

    }());

  });
}

module.exports = loop;
