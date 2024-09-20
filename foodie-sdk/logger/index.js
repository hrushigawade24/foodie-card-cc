const devLogger = require('./devLogger.js')
const productionLogger = require('./productionLogger')
const config = require('../config/cred')

module.exports = function (callingModule) {
    let env = config.ENV;
    if (env.toLowerCase() == 'dev') {
        return devLogger(callingModule);
    } else if (env.toLowerCase() == 'production' || env.toLowerCase() == 'alpha' || env.toLowerCase() == 'qa') {
        return productionLogger(callingModule);
    } else {
        return devLogger(callingModule);
    }
};
