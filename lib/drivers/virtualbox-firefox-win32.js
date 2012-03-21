var browser = require('./virtualbox-browser');

const PATH = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";

function firefoxWin32(cmd, options, callback){
  cmd.path = PATH;
  options.driverName = 'virtualbox-firefox-win32';
  browser(cmd, options,  callback);
}

module.exports = firefoxWin32;
