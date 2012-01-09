var lowkick  = require('../lib/lowkick'),
    highkick = require('highkick'),
    unlinkSync   = require('fs').unlinkSync,
    assert   = require('assert');

assert.arrayContent = function assertContent(a, b){
  assert.ok(a.length == b.length && a.every(function(el){
    return b.indexOf(el) > -1;
  })); 
}

lowkick.logging.setLevel('WARN');

highkick({ module:require('./main'), name:'  main', ordered:true }, function(error, result){
  if(error) throw error;

  unlinkSync('test/tmp-results.json');

  var ok = result.fail == 0;

  lowkick.config.filename('test/config.json');

  lowkick.report.setResult({ 'node': ok }, function(error){
    if(error) throw error;
    
    if(!ok){
      process.exit(1);
    }

  });
  
});
