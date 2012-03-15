!(function(exports){

  exports.testOkFn = function(callback){
    lowkick.api.ok(['foo', 'bar'], function(error){
      lowkick.results(function(error, results){
        assert(results.environ.foo, true);
        assert(results.environ.bar, true);
        callback();
      });
    });
  };

  exports.testFailFn = function(callback){
    lowkick.api.fail(['foo', 'bar'], function(error){
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
    lowkick.signal('begin');

    lowkick.message('Running "testFailFn"');
    exports.testFailFn(function(){
      lowkick.message('Running "testOkFn"');
      exports.testOkFn(function(){
        lowkick.message("All frontend tests passed successfully.");
        lowkick.ok(function(){

          lowkick.signal('end');

          if(lowkick.driver()){ // FIXME
            lowkick.quit();
          }
        });
      });
    });
  }

  $(document).ready(run);

})(this.lowkickPublicTests = {});
