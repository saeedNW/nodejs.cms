/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define category collection schema */
const categorySchema = new Schema({
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
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
categorySchema.index({hashId: 1});
categorySchema.index({name: 1});

/**
 * create a virtual field to be used for
 * collections relation through populate method.
 */
categorySchema.virtual("childes", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent",
});

/** initialize mongoose paginate plugin for courses schema */
categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema);