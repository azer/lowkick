var assert = require('assert'),
    lowkick = require('../lib/lowkick');

function init(options, callback){
  lowkick.config.filename('test/tmp-config.json');
  callback(undefined, options.get, options.post);
}

function testNode(get, post, callback){
  post('command/node', {}, function(error, response, body){
    body = JSON.parse(body);
    assert.equal(Number(body.result.stdout), Math.PI);
    callback();
  });
}

module.exports = {
  'init': init,
  'testNode': testNode
};
