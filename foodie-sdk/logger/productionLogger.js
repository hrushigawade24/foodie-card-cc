const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


var getLabel = function (callingModule) {
  var parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
};

const productionLogger = (name) => {
  return createLogger({
    level: 'debug',
    format: combine(
      label({
        label: name
      }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json()
    ),

    // defaultMeta: { service: 'user-service' },
    transports: [
      new transports.Console(),
      new (transports.File)({
        filename: './logger/all.log',
        label: getLabel(module),
        handleExceptions: true,
        humanReadableUnhandledException: true,
        level: 'info',
        timestamp: true,
        json: true
      }),
      new (transports.File)({
        filename: './logger/errors.log',
        level: 'error',
        prettyPrint: true,
        colorize: true,
        timestamp: true
      })
    ],
  });
}

module.exports = function (module) {
  var myLogger = {
    error: function (text) {
      productionLogger(getLabel(module)).error(text)
    },
    info: function (text) {
      productionLogger(getLabel(module)).info(text)
    }
  }

  return myLogger
}