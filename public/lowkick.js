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

  exports.ok = function ok(){
    lowkick.message('Setting test result of current environment as OK');
    lowkick.api.ok(environPropertyNames(), exports.results);
    lowkick.layout.results();
  };

  exports.fail = function fail(){
    lowkick.message('Setting test result of current environment as FAIL');
    lowkick.api.fail(environPropertyNames(), exports.results);
    lowkick.layout.results();
  };

})(this.lowkick = {});
