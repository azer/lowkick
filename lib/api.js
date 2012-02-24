var connect     = require('connect'),
    virtualbox  = require('virtualbox'),
    join        = require('path').join,
    fs          = require('fs'),
    map         = require('functools').map,
    path        = require('path'),

    config      = require('./config'),
    server      = require('./server'),
    report      = require('./report'),
    logging     = require('./logging'),
    observer    = require('./observer'),
    userscripts = require('./userscripts'),
    sandbox     = require('./sandbox'),
    commander   = require('./commander');

var api = connect(
  connect.bodyParser(),
  connect.router(function(app){

    app.get('/', function(req, res){
      respond(res, { 'lowkick':'welcome!' });
    });

    app.get('/results/?', results);
    app.post('/message/?', message);
    app.post('/set/?', set);
    app.post('/ok/?', ok);
    app.post('/fail/?', fail);
    app.post('/command/:command', command);
    app.post('/quit/?', quit);
  })
);

function p404(req, res){
  respond(res, { 'error': '404 - Not found.' }, 404);
}

function p500(req, res, error){
  respond(res, { 'error': '500 - Internal Server Error', 'stacktrace':error.stack });
}

function respond(response, resultObject, statusCode){
  response.writeHead(statusCode || 200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(resultObject));
}

function testURL(){
  return 'http://10.0.2.2:' + require('./server').port();
}

function command(req, res){
  var commandName = req.params.command,
      options = req.body.options || {};
  
  logging.trace('Running command "%s"', commandName);

  commander.run(commandName, options, function(error, result){

    if(error){
      logging.error('Failed to run command "%s" with options "%s"', commandName, options);
      logging.error(error);
      p500(req, res, error);
      return;
    }

    logging.info('Command "%s" has been executed successfully.', commandName);

    if(!req.body.waitMessage && !req.body["wait-message"]){
      respond(res, { 'command': commandName, 'result': result });
    } else {

      (function waitMessage(){

        if(result.sandbox.messages.length == 0){
          setTimeout(waitMessage, 1000);
        } else {
          res.end(result.sandbox.messages.join('\n'));
        }

      })();

    }

  });
  
}

function message(req, res){
  var message     = req.body.message || req.body.msg,
      sandboxName = req.body.sandbox,
      sbox        = sandbox.get(sandboxName);

  logging.info('[message' + ( sbox ? ' sandbox: '+ sbox.name : '' ) + '] %s', message);

  if(sbox){
    sbox.messages.push(message);
  }

  respond(res, { 'ok': true });
}

function results(req, res){
  report.results(function(error, results){
    if(error){
      logging.error(error);
      p500(req, res, error);
      return;
    }

    results.ok = true;
    results.serverTime = +(new Date);

    respond(res, results);
  });
}


function ok(req, res){
  var options = req.body;
  report.ok(options.environ, function(error){
    if(error){
      logging.error(error);
      p500(req, res, error);
      return;
    }

    logging.info('Set result of "%s" as ok', options.environ);

    respond(res, { 'ok': true });
  });
}

function fail(req, res){
  var options = req.body;
  report.fail(options.environ, function(error){
    if(error){
      logging.error('Failed to set result of "%s" as fail', options.environ);
      logging.error(error);
      p500(req, res, error);
      return;
    }

    logging.info('Set result of "%s" as fail', options.environ);

    respond(res, { 'ok': true });
  });
}

function set(req, res){
  var results = req.body;

  report.setResult(results, function(error){
    if(error){
      p500(req, res, error);
      return;
    }

    respond(res, { 'ok': true });
  });
}

function quit(req, res){
  respond(res, { 'ok': true });
  server.stop();
  quit.observer.emit();
  
  process.nextTick(function(){
    process.exit(0);
  });
}

quit.observer = observer();

module.exports = api;
module.exports.p404 = p404;
module.exports.p500 = p500;
module.exports.observeQuit = quit.observer.add;

