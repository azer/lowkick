!(function(exports, undefined){

  function get(path, callback){
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/api/'+path,
      contentType: "application/json",
      success: function(data){ 
        var error = undefined; 

        if(!data.ok){ 
          error = new Error('Unexpected API Error'); 
        }

        callback && callback(error, data); 
      }
    });
  }

  function post(path, data, callback){
    $.ajax({
      cache: false,
      type: 'POST',
      url: '/api/'+path,
      data: JSON.stringify(data), 
      contentType: "application/json",
      dataType: 'json',
      success: function(data){ 
        var error = undefined; 
        if(!data.ok){ 
          error = new Error('Unexpected API Error'); 
        }

        callback && callback(error, data); 
      }
    });
  }

  exports.get  = get;
  exports.post = post;

  exports.driver = function driver(){
    var params = document.location.href.replace(/[^\?]+\?/, ''),
        driverMatching = params.match(/driver\=([^&]+)/);

      return driverMatching ? driverMatching[1] : undefined;
  };

  exports.ok = function ok(environKeys, callback){
    post('ok', { 'environ': environKeys }, callback);
  };

  exports.fail = function fail(environKeys, callback){
    post('fail', { 'environ': environKeys }, callback);
  };

  exports.set = function set(results, callback){
    post('set', results, callback);
  };

  exports.results = lowkick.results = function results(callback){
    exports.get('results', callback);
  };

  exports.quit = lowkick.quit = function(callback){
    post('quit', {}, callback);
  };

})(this.lowkick.api = {});
