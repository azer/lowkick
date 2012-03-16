var assert = require('assert'),
    lowkick = require('../lib/lowkick');

function init(options, callback){
  lowkick.config.filename('test/tmp-config.json');
  callback(undefined, options.get, options.post);
}

function testNode(get, post, callback){
  
  return callback(); // FIXME;
  
  post('command/node', {}, function(error, response, body){
    if(error){
      callback(error);
      return;
    }

    body = JSON.parse(body);
    assert.equal(Number(body.result.stdout), Math.PI);
    callback();
  });
}

function testShell(get, post, callback){
  post('command/shell', { options: { 'cmd': 'awk "BEGIN{ print 3+0.14 }"' } }, function(error, response, body){
    if(error){
      callback(error);
      return;
    }

    body = JSON.parse(body);

    assert.equal(Number(body.result.stdout), 3.14);
    assert.ok(!body.result.stderr);

    callback();

  });
}

module.exports = {
  'init': init,
  'testNode': testNode,
  'testShell': testShell
};
