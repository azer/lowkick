var debug       = require('debug')('api'),
    connect     = require('connect'),
    virtualbox  = require('virtualbox'),
    join        = require('path').join,
    fs          = require('fs'),
    map         = require('functools').map,
    path        = require('path'),

    server      = require('./server'),
    report      = require('./report'),
    logging     = require('./logging'),
    observer    = require('./observer'),
    userscripts = require('./userscripts'),
    sandbox     = require('./sandbox'),
    commander   = require('./commander');

const IO_OBSERVER_DELAY   = 250,
      IO_OBSERVER_TIMEOUT = 15000,
      
      COMMAND_OPTIONS     = [
        'wait-end-signal', 'messages-only', 'wait-result', 'attachments', 'attachment', 'js', 'loose'
      ];

var api = connect(
  connect.bodyParser(),
  connect.router(function(app){

    app.get('/', function(req, res){
      respond(res, { 'lowkick':'welcome!' });
    });

    app.get('/results/?', results);
    app.get('/sandbox/:sandbox', getSandbox);
    app.post('/sandbox/:sandbox/io', writeIO);
    app.post('/sandbox/:sandbox/io/:eid', respondIOEntry);
    app.get('/sandbox/:sandbox/io/recent/:time', observeIO);
    app.post('/sandbox/:sandbox/eval', eval);
    
    app.post('/message/?', message);
    app.post('/signal/?', signal);
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

  var i = COMMAND_OPTIONS.length,
      cmdname;

  while( i --> 0 ){

    cmdname = COMMAND_OPTIONS[i];

    if( req.body.hasOwnProperty( cmdname ) ){
      options[ cmdname ] = req.body[ cmdname ];
    }
  }

  if( options.loose ){
    !options.attachments && ( options.attachments = [] );
    options['messages-only'] = true;
    options['wait-end-signal'] = true;
  }

  commander.run(commandName, options, function(error, result){

    if(error){
      logging.error('Failed to run command "%s" with options: ', commandName, options);
      logging.error(error);
      p500(req, res, error);
      return;
    }

    logging.info('Command "%s" has been executed successfully.', commandName);

    var sandbox           = result.sandbox,

        messagesOnly      = sandbox && options['messages-only'],
        response          = messagesOnly && result && result.sandbox && result.sandbox.messages || { 'command': commandName, 'result': result },

        _waitForEndSignal = sandbox && options['wait-end-signal'],
        _waitForResult    = sandbox && options['wait-result'],
        
        _respond           = respond.bind(undefined, res, response, undefined);

    if(_waitForEndSignal){
      waitForEndSignal(sandbox, _respond);
    } else if(_waitForResult) {
      waitForResult(sandbox, _respond);
    } else {
      _respond();
    }

  });
  
}

function evalScript(){
  
}

function getSandbox(req, res){
  var sbox = sandbox.get(req.params.sandbox);

  if(!sbox){
    logging.error('Invalid sandbox: ', req.params.sandbox);
    p404(req, res);
    return;
  }

  respond(res, { 'ok': true, 'sandbox': sbox });
}

function signal(req, res){
  var code        = req.body.code,
      sandboxName = req.body.sandbox,
      sbox        = sandbox.get(sandboxName);

  logging.info('[signal' + ( sbox ? ' sandbox: '+ sbox.name : '' ) + '] %s', code);

  if(sbox){
    sbox.signals.push(code);
  }

  respond(res, { 'ok': true });
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

function observeIO(req, res){
  var sbox = sandbox.get(req.params.sandbox),
      mintime = req.params.time;

  if(!sbox){
    logging.error('Invalid sandbox: ', req.params.sandbox);
    p404(req, res);
    return;
  }

  (function iter(i){

    logging.debug('[%d] Observing "%s" IO for entries newer than %d', i, sbox.name, mintime);
    
    var t = sbox.io.length;
    while( t --> 0 && sbox.io[t].ts > mintime );
    t++;

    if( sbox.io.length && t < sbox.io.length ){
      respond(res, { 'ok': true, 'io': sbox.io.slice(t) });
      return;
    }

    if( i * IO_OBSERVER_DELAY >= IO_OBSERVER_TIMEOUT ){
      logging.info('IO observation timed out.');
      respond(res, { 'ok': true });
      return;
    }

    setTimeout(iter, IO_OBSERVER_DELAY, i + 1);

  }(1));
}

function writeIO(req, res){
  var sbox = sandbox.get(req.params.sandbox),
      script = req.body.script || req.body.js || req.body.eval;

  if(!sbox){
    logging.error('Invalid sandbox: ', req.params.sandbox);
    p404(req, res);
    return;
  }

  var eid = sbox.io.push({ 'script': script, 'ts': +(new Date) }) - 1,
      entry = sbox.io[eid];

  entry.id = eid;

  (function iter(i){

    logging.debug('[%d] Observing a response for IO entry#%d on "%s"', i, eid, sbox.name);
    
    if( entry.hasOwnProperty('output') ){
      respond(res, { 'ok': true, 'entry': entry });
      return;
    }

    if( i * IO_OBSERVER_DELAY >= IO_OBSERVER_TIMEOUT ){
      logging.info('IO Entry#%d observation timed out.', eid);
      respond(res, { 'ok': true });
      return;
    }

    setTimeout(iter, IO_OBSERVER_DELAY, i + 1);

  }(1));

}

function respondIOEntry(req, res){
  var sbox   = sandbox.get(req.params.sandbox),
      eid    = req.params.eid,
      output = req.body.output;

  if(!sbox){
    logging.error('Invalid sandbox: ', req.params.sandbox);
    p404(req, res);
    return;
  }

  var entry = sbox.io[eid];
  if(!entry){
    logging.error('Invalid IO entry. Id: %d Sandbox: %s: ', req.params.eid, req.params.sandbox);
    p404(req, res);
    return;
  }

  entry.output = output;

  respond(res, { 'ok': true, 'entry': entry });

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
  var options     = req.body,
      sandboxName = options.sandbox,
      sbox;

  logging.info('%sSetting result of "%s" as OK', sandboxName ? '['+sandboxName+'] ' : '', options.environ);

  if(sandboxName){
    sbox = sandbox.get(sandboxName);
    sbox.result = report.genResultSet(options.environ, true);
    return;
  }

  report.ok(options.environ, function(error){
    if(error){
      logging.error(error);
      p500(req, res, error);
      return;
    }

    respond(res, { 'ok': true });
  });
}

function fail(req, res){
  var options     = req.body,
      sandboxName = options.sandbox,
      sbox;

  logging.info('%sSetting result of "%s" as FAIL', sandboxName ? '['+sandboxName+'] ' : '', options.environ);

  if(sandboxName){
    sbox = sandbox.get(sandboxName);
    sbox.result = report.genResultSet(options.environ, false);
    return;
  }

  report.fail(options.environ, function(error){
    if(error){
      logging.error(error);
      p500(req, res, error);
      return;
    }

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

function waitForEndSignal(sandbox, callback){

  logging.info('['+sandbox.name+'] Waiting for the END signal...');

  if(sandbox.signals.indexOf('END') == -1){
    setTimeout(waitForEndSignal, 1000, sandbox, callback);
  } else {
    callback();
  }

}

function waitForResult(sandbox, callback){

  logging.info('['+sandbox.name+'] Waiting for the sandbox result...');

  if(sandbox.result === undefined){
    setTimeout(waitForResult, 1000, sandbox, callback);
  } else {
    callback();
  }

}

module.exports = api;
module.exports.p404 = p404;
module.exports.p500 = p500;
module.exports.observeQuit = quit.observer.add;

