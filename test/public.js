!(function(exports){

  exports.testOkFn = function(callback){
    lowkick.ok(['foo', 'bar'], function(error){
      lowkick.results(function(error, results){
        assert(results.environ.foo, true);
        assert(results.environ.bar, true);
        callback();
      });
    });
  };

  exports.testFailFn = function(callback){
    lowkick.fail(['foo', 'bar'], function(error){
      lowkick.results(function(error, results){
        assert(results.environ.foo, false);
        assert(results.environ.bar, false);
        callback();
      });
    });
  };

  function assert(a, b){
    if(a !== b ){
      throw new Error('Assertion Error: '+a+' == '+b);
    }
  }

  function run(){
    exports.testFailFn(function(){
      exports.testOkFn(function(){
        lowkick.layout.ok();
      });
    });
  }

  $(document).ready(run);

})(this.lowkickPublicTests = {});
