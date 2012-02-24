var browser = require('./virtualbox-browser');

const PATH = "C:\\Program Files\\Internet Explorer\\iexplore.exe";

function ie(cmd, options, callback){
  cmd.path = PATH;
  options.driverName = 'virtualbox-ie';
  browser(cmd, options,  callback);
}

module.exports = ie;
