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
