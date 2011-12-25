var http        = require('http'),
    logging     = require('./logging'),
    config      = require('./config'),
    report      = require('./report'),
    userscripts = require('./userscripts'),
    revision    = require('./revision'),
    verify      = require('./verify'),
    server      = require('./server'),
    cli         = require('./cli'),
    undefined;

function quiet(){
  logging.setLevel('ERROR');
}

function verbose(){
  logging.setLevel('TRACE');
}

module.exports = {
  'config': config,
  'cli': cli,
  'logging': logging,
  'quiet': quiet,
  'revision': revision,
  'report': report,
  'server': server,
  'userscripts': userscripts,
  'verbose': verbose,
  'verify': verify
}
