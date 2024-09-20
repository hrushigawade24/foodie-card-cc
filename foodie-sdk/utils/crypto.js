const logger = require('../logger')(module);

const getDataHash = (data) => {

    try {
        logger.info('getDataHash')
        const crypto = require('crypto');
        const hash = crypto.createHash('sha1');
        hash.setEncoding('hex');
        hash.write(data);
        hash.end();
        let dataHash = hash.read();
        return dataHash
    } catch (error) {
        logger.error('getDataHash', error)
        console.log(`Error ocuured whiile creating file data hash: Error: ${error}`)
        return null
    }
}

module.exports = {
    getDataHash
}