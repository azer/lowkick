var connect = require('connect'),
    report = require('./report'),
    logging = require('./logging');


var api = connect(
  connect.bodyParser(),
  connect.router(function(app){

    app.get('/', function(req, res){
      respond(res, { 'lowkick':'welcome!' });
    });

    app.post('/set/?', set);
    app.post('/ok/?', ok);
    app.post('/fail/?', fail);
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

function ok(req, res){
  var options = req.body;
  report.ok(options.environ, function(error){
    if(error){
      logging.error('Failed to set result of "%s" as ok', options.environ);
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

module.exports = api;
module.exports.p404 = p404;
module.exports.p500 = p500;
