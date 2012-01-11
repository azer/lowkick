var observer = function observer(){

  var callbacks;

  function add(fn){
    callbacks.push(fn);
  }

  function emit(){
    var fns = callbacks.slice(0),
        i = callbacks.length,
        fn;

    reset();

    while(i-->0){
      process.nextTick(fns[i].bind(undefined, arguments[0]));
    }
  }
  
  function reset(){
    callbacks = [];
  }

  reset();

  return {
    'add': add,
    'emit': emit,
    'reset': reset
  };

};

module.exports = observer;
