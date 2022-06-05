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
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
roleSchema.index({hashId: 1});
roleSchema.index({name: 1});
roleSchema.index({label: 1});

/** initialize mongoose paginate plugin for category schema */
roleSchema.plugin(mongoosePaginate);

/**
 * create a virtual field to be used for
 * roles and users collections relation
 * through populate method.
 */
roleSchema.virtual("users", {
    ref: "User",
    localField: "_id",
    foreignField: "roles",
});

module.exports = mongoose.model('Role', roleSchema);