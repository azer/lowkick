!(function(exports){

  var messages = [];

  exports.add = lowkick.message = function add(msg){
    messages.push( messages.length + '. ' + msg );
    exports.display();

    lowkick.post('message', { 'msg': msg });
  };

  exports.get = function get(){
    return messages;
  };

  exports.display = function display(){
    var html = '',
        i = messages.length,
        to = i-3;
    
    while(i-->to){
      html += messages[i] + '<br />';
    }

    $("#messages").html(html);
  };

  $(document).ready(exports.display);


})(this.lowkick.messages = {});


