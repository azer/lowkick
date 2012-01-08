var log4js = require('log4js'),
    logger = log4js.getLogger('lowkick');

logger.setLevel('INFO');

function filename(uri){
  logger.info('Adding "%s" as a file appender to the logger.', uri);
  log4js.addAppender(log4js.fileAppender(uri));
}

module.exports = logger;
module.exports.filename = filename;


