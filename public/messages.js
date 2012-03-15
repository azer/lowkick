!(function(exports){

  var messages = [];

  exports.publish = lowkick.message = function publish(msg, callback){
    exports.add(msg);
    lowkick.api.post('message', { 'msg': msg, 'sandbox': lowkick.sandbox() }, callback);
  };

  exports.add = function add(msg){
    messages.push( (messages.length+1) + '. ' + msg );
    exports.display();
  };

  exports.get = function get(){
    return messages;
  };

  exports.display = function display(){
    var html = '',
        i = messages.length,
        to = i > 2 ? i-5 : 0;
    
    while(i-->to){
      html += messages[i] + '<br />';
    }

    $("#messages").html(html);
  };

  $(document).ready(exports.display);


})(this.lowkick.messages = {});


