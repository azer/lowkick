var common = require('./common');

var enabled = [
  'node'
];

enabled.forEach(function(moduleName){
  common.add(moduleName, require('./'+moduleName));
});

module.exports = common;

