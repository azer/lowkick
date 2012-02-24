!(function(exports, undefined){

  function environPropertyNames(){
    var keys = [],
        props = environ(),
        key;

    for(key in props){
      keys.push(key);
    }

    return keys;
  }

  exports.params = function params(){
    var qs       = document.location.href.replace(/[^\?]+\?/, ''),
        matching = qs.match(/params\=([^&]+)/),
        encoded  = matching && matching[1].replace(/_/g, '%');

    return encoded ? JSON.parse( decodeURI(encoded) ) : {};
  };

  exports.driver = function driver(){
    return exports.params().driver;
  };

  exports.sandbox = function sandbox(){
    return exports.params().sandbox;
  };

  exports.ok = function ok(callback){
    lowkick.message('Setting test result of current environment as OK');
    lowkick.api.ok(environPropertyNames(), callback);
    lowkick.layout.results();
  };

  exports.fail = function fail(callback){
    lowkick.message('Setting test result of current environment as FAIL');
    lowkick.api.fail(environPropertyNames(), callback);
    lowkick.layout.results();
  };

})(this.lowkick = {});
