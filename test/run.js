var lowkick  = require('../lib/lowkick'),
    highkick = require('highkick'),
    rimraf   = require('rimraf');

lowkick.verbose();

highkick({ module:require('./main'), name:'  main', ordered:true }, function(error, result){
  if(error) throw error;

});
