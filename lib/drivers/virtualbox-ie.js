var virtualbox = require('./virtualbox');

const PATH = "C:\\Program Files\\Internet Explorer\\iexplore.exe";

function ie(cmd, options, callback){
  virtualbox({ vm: cmd.vm, path: PATH }, { 'params': ( cmd.url || cmd.link || cmd.open || cmd.target || cmd.browse ) + '?driver=virtualbox-ie' }, callback);
}

module.exports = ie;
