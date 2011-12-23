var connect  = require('connect'),
    mustache = require('mustache'),
    join     = require('path').join,
    readFile = require('fs').readFile,
    lowkick  = require('./lowkick'),
    report   = require('./report'),
    logging  = require('./logging');
    
function genHomepage(scripts){
  return function homepage(req, res){
    lowkick.config(function(configError, config){
      if(configError) return p500(req, res, configError);

      lowkick.revision(function(revision){

        report.results(function(reportError, results){

          if(reportError) return p500(req, res, reportError);

          readFile(join(__dirname, '../templates/index.html'), function(templateReadError, bf){
            if(templateReadError) return p500(req, res, templateReadError);

            var template = bf.toString(),
                view = { 
                  'revision': revision, 
                  'name': config.name, 
                  'scripts': scripts, 
                  'results': results,
                  'results': JSON.stringify(results, null, 4),
                  'config': JSON.stringify(config, null, 4),
                  'resultsFilename': report.filename(),
                  'configFilename': lowkick.config.filename()
                },
                response = mustache.to_html(template, view);

            logging.info('Outputting test page for %s', req.headers['user-agent']);
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(response);
          });

        });

      });

    });
  };
};

function genOutputScript(filename){
  return function outputScript(req, res){
    readFile(filename, function(error, bf){
      if(error){

        logging.error('Failed to read script from ', filename);
        logging.error(error);
        p500(req, res, error);

        return;
      }

      res.end(bf.toString());
    });
  };
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

  lowkick.userscripts(function(error, scripts){

    if(error) throw error;

    var port = options.port || 3000,
        host = options.host || 'localhost';

    logging.info('Starting server at %s:%d', host, port);

    var homepage = genHomepage(scripts),
        index = connect(connect.router(function(app){
          app.get('/', homepage); 
          app.get('/index.html', homepage);
        }));

    var api = connect(
      connect.bodyParser(),
      connect.router(function(app){

        app.get('/', function(req, res){
          respond(res, { 'lowkick':'welcome!' });
        });

        app.post('/set/?', function(req, res){
          var browser = req.body.browser,
              os      = req.body.os,
              version = req.body.version,
              result  = req.body.result;

          report.setResult(browser, version, os, result, function(error){
            if(error){
              logging.error('Failed to set result of %s/%s %s', os, browser, version);
              logging.error(error);
              p500(req, res, error);
              return;
            }

            logging.info('Set result of %s/%s %s as %s', os, browser, version, result);

            respond(res, { 'ok': true });
          });
          
        });

        app.post('/ok/?', function(req, res){
          var options = req.body;
          report.ok(options, function(error){
            if(error){
              logging.error('Failed to set result of %s/%s %s', options.os, options.browser, options.version);
              logging.error(error);
              p500(req, res, error);
              return;
            }

            logging.info('Set result of %s/%s %s as true', options.os, options.browser, options.version);

            respond(res, { 'ok': true });
          });
          
        });


        app.post('/fail/?', function(req, res){
          var options = req.body;
          report.fail(options, function(error){
            if(error){
              logging.error('Failed to set result of %s/%s %s', options.os, options.browser, options.version);
              logging.error(error);
              p500(req, res, error);
              return;
            }

            logging.info('Set result of %s/%s %s as false', options.os, options.browser, options.version);

            respond(res, { 'ok': true });
          });
          
        });

      })
    );

    var statik = connect(connect.router(function(app){
      var i = scripts.length, url;
      while(i-->0){
        url = join('/',scripts[i]);
        logging.debug('Setting new static URL:', 'static/'+url);
        app.get(url, genOutputScript(scripts[i]));
      }
    }));

    connect()
      .use('/', index)
      .use('/static', statik)
      .use('/api', api)
      .use(p404)
      .listen(port);

  });
}

module.exports = {
  'start': start
}
