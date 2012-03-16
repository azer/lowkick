var rimraf      = require('rimraf'),
    mkdirp      = require('mkdirp'),
    path        = require('path'),
    fs          = require('fs'),
    map         = require('functools').map,

    config      = require('./config'),
    logging     = require('./logging'),
    userscripts = require('./userscripts');

const MEM = {};

var id = (function genId(){

  var counter = 0;

  return function id(){
    return 'sandbox'+(++counter);
  };

})();

function construct(options, callback){
  var name = id(),
      path = dir(name),
      attachments = options.attachments;

  logging.debug('Constructing new sandbox "%s"', name);

  saveAttachments(path, attachments, function(error, attachmentPaths){

    if(error){
      logging.error('Failed to save attachments');
      logging.error(error);
      callback(error);
      return;
    }

    MEM[name] = {
      'name': name,
      'path': path,
      'attachments': attachments,
      'attachmentPaths': attachmentPaths,
      'messages': [],
      'signals': [],
      'options': options,
      'result': undefined
    };

    logging.info('Sandbox "%s" has been constructed. Attachments: %s', name, attachmentPaths && attachmentPaths.join(', '));

    callback(undefined, get(name));

  });

}

function dir(id){
  return path.join(config.dirname(), '.lowkick-'+id);
}

function get(name){
  return MEM[name];
}

function kill(name){
  removeAttachments(get(name).path, function(removeError){

    if(removeError){
      logging.warn('Failed to remove command files');
      logging.warn(removeError);
    }

    delete MEM[name];

  });
}

function removeAttachments(dir, callback){
  logging.info('Removing sandbox directory "%s"', dir);
  rimraf(dir, callback);
};

function saveAttachment(dir, file, callback){
  var filename = path.join(dir, file.name);

  logging.debug('Saving "%s"', filename);

  mkdirp(dir, function(/* ignore directory creation error */){

    fs.writeFile(filename, file.content, function(writeError){
      if(writeError){
        logging.error('Failed to write %s', filename);
        logging.error(writeError);
        callback(writeError);
        return;
      }

      callback(undefined, filename);
    });

  });
}

function saveAttachments(dir, files, callback){
  if(!files || !files.length){
    callback();
    return;
  }

  logging.info('Saving attachments to "%s"', dir);
  map.async(saveAttachment.bind(undefined, dir), files, callback);
}

module.exports = {
  'construct': construct,
  'get': get,
  'kill': kill,
  'saveAttachments': saveAttachments,
  'saveAttachment': saveAttachment
};
