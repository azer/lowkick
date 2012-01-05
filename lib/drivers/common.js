var drivers = (function(){

  var value = {};

  return function drivers(newValue){
    if(arguments.length > 0){
      value = newValue;
    }

    return value;
  };

})();

function add(name, fn){
  drivers()[name] = {
    'name': name,
    'run': fn
  };

  return recognize(name);
}

function remove(name){
  delete drivers()[name];
}

function recognize(name){
  return drivers()[name];
}

module.exports = {
  'all': drivers,
  'add': add,
  'remove': remove,
  'recognize': recognize
};
