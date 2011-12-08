var log4js = require('log4js'),
    logger = log4js.getLogger('server');

logger.setLevel('INFO');

module.exports = logger;
