var util      = require('util'),
    inspect   = util.inspect,
    puts      = util.puts,
    config    = require('./config'),
    logging   = require('./logging'),
    server    = require('./server'),
    report    = require('./report'),
    verify    = require('./verify'),
    commander = require('./commander');
 
function publish(){
  var configdoc = config();
    
  server.start({ 
    'port': configdoc.server && configdoc.server.port, 
    'host': configdoc.server && configdoc.server.host 
  });
}

function verifyInterface(){
  verify(function(error, results){
    if(error){
      logging.error('An error occured: ', error);
      throw error;
    }

    var passed   = results.passed.join(', '),
        failed   = results.failed.join(', '),
        untested = results.untested.join(', ');

    puts((untested ? ( 'Not Tested: '.bold + untested + '\n' ).blue : '')
         + ( passed ? ( 'Passed: '.bold + passed + '\n' ).green : '')
         + ( failed ? ( 'Failed: '.bold + failed + '\n' ).red : '' )
         + '\n'
         + 'Revision: '.bold
         + results.revision
         + '\nResults Source: '.bold
         + report.filename()
         + '\nConfig: '.bold
         + config.filename()
        );
  });
}

function command(commandName){
  commander.run(commandName, {}, function(error, result){
    if(error) throw error;
    logging.info('Ran command "%s" successfully.', commandName);
    puts(inspect(result));
  });
}

module.exports = {
  'command': command,
  'publish': publish,
  'verify': verifyInterface
};
