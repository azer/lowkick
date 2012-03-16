!(function(exports){

  exports.results = function results(callback){
    $("#results").html("Updating results...");

    lowkick.api.results(function(error, results){
      if(error){
        lowkick.message('Failed to fetch test results...');
        callback(error);
        return;
      }

      lowkick.messages.add('Updating results...');
      $("#results").html(JSON.stringify(results, null, 4).replace(/\n/g, "<br />"));
      callback && callback();
    });
  };

  $(document).ready(function(){

    var sandboxName = lowkick.sandbox();
    $('.sandbox-name').html(sandboxName);

    $("#env").html(JSON.stringify(environ(), null, 4).replace(/\n/g, '<br />'));

    exports.results(function(error){
      if(error) throw error;
      lowkick.messages.add('Ready.');
    });
  });

})(this.lowkick.layout = {});
