(function(globals, undefined){

  var consoleImpl = typeof console != 'undefined',
      modulesImpl = typeof module != 'undefined' && module.exports,

      proxy       = lowkick.message,
      logger      = consoleImpl && console.log;

  if( !consoleImpl ){
    globals.console = {};
  };

  console.log = function lowkick_log_wrapper(){
    proxy.apply(console, arguments);
    logger && logger.apply(console, arguments);
  };

})( this );

