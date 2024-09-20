

const DOC_TYPE_OUT_OF_RANGE = 'Provided document type is not a valid one.'
const INVALID_FILE_FORMAT = 'Invalid file template. Please check !'

const ID_NOT_FOUND = (key, id) => {
    return `${key} details not found for ID: ${id}`
}

const ID_DOESNOT_EXIST = (id) => {
    return `${id} does not exist`
}

module.exports = {
    DOC_TYPE_OUT_OF_RANGE,
    INVALID_FILE_FORMAT,
    ID_NOT_FOUND,
    ID_DOESNOT_EXIST
}