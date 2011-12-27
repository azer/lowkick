!(function(exports){

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
    lowkick.ok(environPropertyNames(), exports.results);
  };

  exports.fail = function fail(){
    lowkick.message('Setting test result of current environment as FAIL');
    lowkick.fail(environPropertyNames(), exports.results);
  };

  exports.results = function results(callback){
    $("#results").html("Updating results...");

    lowkick.results(function(error, results){
      if(error){
        lowkick.message('Failed to fetch test results...');
        callback(error);
        return;
      }

      lowkick.message('Updating results...');
      $("#results").html(JSON.stringify(results, null, 4).replace(/\n/g, "<br />"));
      callback && callback();
    });
  };

  $(document).ready(function(){
    $("#env").html(JSON.stringify(environ(), null, 4).replace(/\n/g, '<br />'));

    exports.results(function(error){
      if(error) throw error;
      lowkick.message('Ready.');
    });
  });

})(this.lowkick.layout = {});
