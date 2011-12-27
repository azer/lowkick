var config  = require('./config'),
    logging = require('./logging'),
    server  = require('./server'),
    report  = require('./report'),
    verify  = require('./verify'),
    puts    = require('util').puts;


function publish(){
  config(function(error, configdoc){
    
    if(error) {
      logging.error('Failed to read config file at "%s".', config.filename());
      logging.error(error);
    }

    server.start({ 
      'port': configdoc.server && configdoc.server.port, 
      'host': configdoc.server && configdoc.server.host 
    });

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

module.exports = {
  'publish': publish,
  'verify': verifyInterface
};
