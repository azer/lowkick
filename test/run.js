var highkick = require('highkick');

highkick({ module:require('./main'), name:'  main', ordered:true }, function(error, result){
  if(error) throw error;
});
