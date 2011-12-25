var connect     = require('connect'),
    mustache    = require('mustache'),
    join        = require('path').join,
    readFile    = require('fs').readFile,
    lowkick     = require('./lowkick'),
    report      = require('./report'),
    config      = require('./config'),
    revision    = require('./revision'),
    logging     = require('./logging'),
    userscripts = require('./userscripts'),
    api         = require('./api');

var hostname = (function(){

  var value;

  return function hostname(newValue){
    if(arguments.length > 0){
      value = newValue;
    }

    return value;
  }

})();


var port = (function(){

  var value;

  return function port(newValue){
    if(arguments.length > 0){
      value = newValue;
    }

    return value;
  };

})();
    
function genHomepage(scripts){
  return function homepage(req, res){
    config(function(configError, configdoc){
      if(configError) return api.p500(req, res, configError);

      revision(function(revision){

        report.results(function(reportError, results){

          if(reportError) return api.p500(req, res, reportError);

          readFile(join(__dirname, '../templates/index.html'), function(templateReadError, bf){
            if(templateReadError) return api.p500(req, res, templateReadError);

            var template = bf.toString(),
                view = { 
                  'revision': revision, 
                  'name': configdoc.name, 
                  'scripts': scripts, 
                  'results': results,
                  'results': JSON.stringify(results, null, 4),
                  'config': JSON.stringify(configdoc, null, 4),
                  'resultsFilename': report.filename(),
                  'configFilename': config.filename()
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
        api.p500(req, res, error);

        return;
      }

      res.end(bf.toString());
    });
  };
}

function start(options){

  userscripts(function(error, scripts){

    if(error) throw error;

    port(options.port || 3000);
    hostname(options.host || 'localhost');

    logging.info('Starting server at %s:%d', hostname(), port());

    var homepage = genHomepage(scripts),
        index = connect(connect.router(function(app){
          app.get('/', homepage);
          app.get('/index.html', homepage);
        }));

    var scripts = connect(connect.router(function(app){
      var i = scripts.length, url;
      while(i-->0){
        url = join('/',scripts[i]);
        logging.debug('Setting new script URL:', 'static/'+url);
        app.get(url, genOutputScript(scripts[i]));
      }
    }));

    var statik = connect.static(join(__dirname, '../public'));

    connect()
      .use('/', index)
      .use('/scripts', scripts)
      .use('/static', statik)
      .use('/api', api)
      .use(api.p404)
      .listen(port());

  });
}

module.exports = {
  'hostname': hostname,
  'port': port,
  'start': start
}
