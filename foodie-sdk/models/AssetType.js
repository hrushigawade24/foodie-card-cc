const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

/**
 * 
 * 
 */
var assetType = new Schema({
    assetTypeId: { 
        type: Number },
    appChannelId: { 
        type: Number, required: true },
    docType: { 
        type: String, required: true },
    assetType: {
        type: String, required: true, unique: true },
    sourceIdAttribute: {
        type: String, required: true },
    targetIdAttribute: {
        type: String, required: false },
    enforceIntigrity: {
        type: Boolean, required: false },
    status: {
        type: Number, default: true } ,
    createdBy: {
        type: String, required: false },
    createdAt: { 
        type: Date, required: false, default: Date.now },
    updatedBy: {
        type: String, required: false },
    updatedAt: { 
        type: Date, required: false, default: Date.now } 
});

assetType.plugin(AutoIncrement, {inc_field: 'assetTypeId'});
const AssetTypeList = mongoose.model('AssetType', assetType);

module.exports = AssetTypeList;