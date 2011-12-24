var http        = require('http'),
    logging     = require('./logging'),
    config      = require('./config'),
    report      = require('./report'),
    userscripts = require('./userscripts'),
    revision    = require('./revision'),
    verify      = require('./verify'),
    undefined;

function quiet(){
  logging.setLevel('ERROR');
}

function verbose(){
  logging.setLevel('TRACE');
}

module.exports = {
  'config': config,
  'logging': logging,
  'revision': revision,
  'report': report,
  'quiet': quiet,
  'userscripts': userscripts,
  'verbose': verbose,
  'verify': verify
}
