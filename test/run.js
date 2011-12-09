var logging = require('../lib/logging'),
    highkick = require('highkick');

logging.setLevel('ERROR');

highkick({ module:require('./main'), name:'  main', ordered:true }, function(error, result){
  if(error) throw error;
});
