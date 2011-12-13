var connect  = require('connect'),
    mustache = require('mustache'),
    join     = require('path').join,
    readFile = require('fs').readFile,
    lowkick  = require('./lowkick'),
    logging  = require('./logging');
    
var statik = connect( connect.static(join(__dirname, '../public')) ),
    index = connect( connect.router(function(app){ app.get('/', homepage); app.get('/index.html', homepage); }) );

var api = connect(
  connect.router(function(app){

    app.get('/', function(req, res){
      respond(res, { 'lowkick':'welcome!' });
    });

  })
);

function homepage(req, res){
  lowkick.config(function(configError, config){
    if(configError) return p500(req, res, configError);

    lowkick.revision(function(revision){

      readFile(join(__dirname, '../public/index.html'), function(templateReadError, bf){
        if(templateReadError) return p500(req, res, templateReadError);

        var template = bf.toString(),
            response = mustache.to_html(template, { 'revision': revision, 'name': config.name, 'scripts': config.scripts });
        
        logging.info('Outputting homepage...');

        res.end(response);
      });

    });

  });
}

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

function start(options){
  var port = options.port || 3000,
      host = options.host || 'localhost';

  logging.info('Starting server at %s:%d', host, port);

  connect()
    .use('/', index)
    .use('/', statik)
    .use('/api', api)
    .use(p404)
    .listen(port);
}

module.exports = {
  'start': start,
  'static': statik,
  'api': api
}
