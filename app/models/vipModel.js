/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define category collection schema */
const vipSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    months: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

/** define collection indexes */
vipSchema.index({hashId: 1});
vipSchema.index({name: 1});
vipSchema.index({status: 1});

/** initialize mongoose paginate plugin for category schema */
vipSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Vip', vipSchema);