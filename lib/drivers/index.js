var common  = require('./common'),
    enabled = require('./enabled');

enabled.forEach(function(moduleName){
  common.add(moduleName, require('./'+moduleName));
});

module.exports = common;

