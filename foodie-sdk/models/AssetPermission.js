const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

/**
 * 
 * 
 */
var assetPermission = new Schema({
    assetPermissionId: { type: Number, required: false },
    assetTypeId: { type: Number, required: true },
    assetType: { type: String, required: true },
    orgId: { type: Number, required: true },
    role: { type: String, required: true },
    status: { type: Number, default: true },
    createdBy: {
        type: String, required: false
    },
    createdAt: {
        type: Date, required: false, default: Date.now
    },
    updatedBy: {
        type: String, required: false
    },
    updatedAt: {
        type: Date, required: false, default: Date.now
    }
});

assetPermission.plugin(AutoIncrement, { inc_field: 'assetPermissionId' });
const AssetPermissionList = mongoose.model('AssetPermission', assetPermission);

module.exports = AssetPermissionList;