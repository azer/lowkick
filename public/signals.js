!(function(exports){

  var SIGNALS = [
    'LOAD',
    'BEGIN',
    'END',
    'SUCCESS',
    'FAIL'
  ];

  exports.send = lowkick.signal = function send(signal, callback){
    signal = signal.toUpperCase();

    if( jQuery.inArray(signal, SIGNALS) == -1 ){
      lowkick.message('Undefined signal "' + signal + '"');
      callback(new Error('Invalid Signal "' + signal + '"'));
      return;
    }

    lowkick.messages.add(':' + signal);

    lowkick.api.post('signal', { 'code': signal, 'sandbox': lowkick.sandbox() }, callback);

  };

})( this.lowkick.signals = {} );
