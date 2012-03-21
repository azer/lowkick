var browser = require('./virtualbox-browser');

const PATH = "C:\\Documents and Settings\\Administrator\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe";

function chromeWin32(cmd, options, callback){
  cmd.path = PATH;
  options.driverName = 'virtualbox-chrome-win32';
  browser(cmd, options,  callback);
}

module.exports = chromeWin32;
