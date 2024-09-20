const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

/**
 * 
 * 
 */
var assetRefType = new Schema({
    assetRefDefId: { 
        type: Number },
    appChannelId: { 
        type: Number, required: true },
    assetType: {
        type: String, required: true, unique: true },
    sourceAssetAttribute: {
        type: String, required: true },
    targetAssetAttribute: {
        type: String, required: false },
    enforceIntigrity: {
        type: Boolean, required: false },
    sourceAssetSection: {
        type: String, required: true },    
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

assetRefType.plugin(AutoIncrement, {inc_field: 'assetRefDefId'});
const AssetReference = mongoose.model('assetReference', assetRefType);

module.exports = AssetReference;