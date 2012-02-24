!(function(exports){

  var messages = [];

  exports.add = lowkick.message = function add(msg, callback){
    messages.push( (messages.length+1) + '. ' + msg );
    exports.display();

    lowkick.api.post('message', { 'msg': msg, 'sandbox': lowkick.sandbox() }, callback);
  };

  exports.get = function get(){
    return messages;
  };

  exports.display = function display(){
    var html = '',
        i = messages.length,
        to = i > 2 ? i-3 : 0;
    
    while(i-->to){
      html += messages[i] + '<br />';
    }

    $("#messages").html(html);
  };

  $(document).ready(exports.display);


})(this.lowkick.messages = {});


