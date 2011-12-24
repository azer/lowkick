var lowkick  = require('../lib/lowkick'),
    highkick = require('highkick'),
    rimraf   = require('rimraf'),
    assert   = require('assert');

assert.arrayContent = function assertContent(a, b){
  assert.ok(a.length == b.length && a.every(function(el){
    return b.indexOf(el) > -1;
  })); 
}

lowkick.quiet();

highkick({ module:require('./main'), name:'  main', ordered:true }, function(error, result){
  if(error) throw error;
});
