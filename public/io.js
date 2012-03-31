!(function(exports, undefined){

  var URI      = 'sandbox/' + lowkick.sandbox() + '/io/',
      tscursor = 0,
      request  = undefined;

  function respond(entry){
    var output;
    
    try {
      output = eval(entry.script);
    } catch(err) {
      output = err.stack || err.message || err;
    }

    lowkick.api.post( URI + entry.id, { 'output': output });
  };

  function subscribe(){
    var i, entry;
    (function loop(error, response){

      if(error){
        return;
      }
      
      if(response && response.io){
        i = response.io.length;
        while( i --> 0 ){
          entry = response.io[i];
          entry.ts > tscursor && ( tscursor = entry.ts );
          respond(entry);
        }
      }

      request = lowkick.api.get(URI + 'recent/' + tscursor, loop);

    })();
  };

  function unsubscribe(){
    request && request.abort && request.abort();
  };

  exports.respond = respond;
  exports.subscribe = subscribe;
  exports.unsubscribe = unsubscribe;

}( this.lowkick.io = {} ));
