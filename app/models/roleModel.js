/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define category collection schema */
const roleSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    label: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Permission'
    }]
}, {timestamps: true});

/** define collection indexes */
roleSchema.index({hashId: 1});
roleSchema.index({name: 1});
roleSchema.index({label: 1});

/** initialize mongoose paginate plugin for category schema */
roleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Role', roleSchema);