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
    api;

var runningServer;

var hostname = (function(){
  var value;
  return function hostname(newValue){

    if(arguments.length > 0){
      value = newValue;
      
      logging.info('Hostname has been set to "%s"', newValue);
    }

    return value;
  };

})();


var port = (function(){

  var value;

  return function port(newValue){
    if(arguments.length > 0){
      value = newValue;

      logging.info('Port number has been set to "%s"', newValue);
    }

    return value;
  };

})();
    
function genHomepage(scripts){
  var configdoc = config();

  return function homepage(req, res){

    revision(function(revision){

      report.results(function(reportError, results){

        if(reportError) {
          api.p500(req, res, reportError);
          return;
        }

        readFile(join(__dirname, '../templates/index.html'), function(templateReadError, bf){
          if(templateReadError){ 
            api.p500(req, res, templateReadError);
            return;
	        }

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

function start(callback){

  api = require('./api');

  if(runningServer != undefined){
    logging.warn('Server is running already.');
    return;
  }

  userscripts(function(error, scriptFiles){

    if(error) throw error;

    logging.info('Starting server at %s:%d', hostname(), port());

    var homepage = genHomepage(scriptFiles),
        index = connect(connect.router(function(app){
          app.get('/', homepage);
          app.get('/index.html', homepage);
        }));

    var scripts = connect(connect.router(function(app){
      var i = scriptFiles.length, url;
      while(i-->0){
        url = join('/',scriptFiles[i]);
        logging.debug('Setting new script URL:', 'static/'+url);
        app.get(url, genOutputScript(scriptFiles[i]));
      }
    }));

    var statik = connect['static'](join(__dirname, '../public'));

    runningServer = connect();

    runningServer
      .use('/', index)
      .use('/scripts', scripts)
      .use('/static', statik)
      .use('/api', api)
      .use(api.p404)
      .listen(port());

    callback && callback();

  });

}

function stop(){
  if(runningServer == undefined){
    logging.warn('Server is not running already.');
    return;
  }
  runningServer.close();
  runningServer = undefined;
  logging.info('Server has been stopped.');
}

module.exports = {
  'hostname': hostname,
  'port': port,
  'start': start,
  'stop': stop
};
