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
    sandbox     = require('./sandbox'),
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
    
function genHomepage(){
  var configdoc = config();

  return function homepage(req, res){

    revision(function(revision){

      report.results(function(reportError, results){

        if(reportError) {
          logging.error(reportError);
          api.p500(req, res, reportError);
          return;
        }

        userscripts(function(userscriptsError, scripts){

          if(userscriptsError) {
            logging.error(userscriptsError);
            api.p500(req, res, userscriptsError);
            return;
          }

          readFile(join(__dirname, '../templates/index.html'), function(templateReadError, bf){
            if(templateReadError){ 
              api.p500(req, res, templateReadError);
              return;
	          }

            var params, sandboxName, sandboxInst;
            
            try {

              params = req.query && req.query.params && decodeURI(req.query.params.replace(/_/g, '%'));
              logging.info('Given parameters: ', params);
              params = params && JSON.parse(params);
              sandboxInst = params.sandbox && sandbox.get(params.sandbox);

              sandboxInst && logging.info('Given sandbox name: %s', params.sandbox);

            } catch(error){
              logging.error(error);
              logging.error('Invalid params "%s"', params);
              params = undefined;
            }

            var template = bf.toString(),
                view = { 
                  'revision': revision, 
                  'name': configdoc.name,
                  'sandbox': sandboxName,
                  'sandboxScripts': sandboxInst && sandboxInst.attachmentPaths,
                  'scripts': scripts, 
                  'results': results,
                  'results': JSON.stringify(results, null, 4),
                  'config': JSON.stringify(configdoc, null, 4),
                  'resultsFilename': report.filename(),
                  'configFilename': config.filename()
                },
                response = mustache.to_html(template, view);

            logging.info(( sandboxInst ? '[Sandbox ' + sandboxInst.name + '] ' : '' ) + 'Outputting test page for %s', req.headers['user-agent']);
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(response);
          });

        });

      });

    });

  };
};


function isRunning(){
  return runningServer != undefined;
}

function start(callback){

  api = require('./api');

  if(isRunning()){
    logging.warn('Server is running already.');
    callback(new Error('Server is running already'));
    return;
  }

  logging.info('Starting server at %s:%d', hostname(), port());

  var homepage = genHomepage(),
      scripts  = connect(connect.router(userscripts.router)),
      statik   = connect['static'](join(__dirname, '../public')),

      index    = connect(connect.router(function(app){
        app.get('/', homepage);
        app.get('/index.html', homepage);
      }));

  runningServer = connect(connect.query());

  runningServer
    .use('/', index)
    .use('/scripts', scripts)
    .use('/static', statik)
    .use('/api', api)
    .use(api.p404)
    .listen(port());

  callback && callback();

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
  'isRunning': isRunning,
  'port': port,
  'start': start,
  'stop': stop
};
