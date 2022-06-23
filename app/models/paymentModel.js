/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define payment collection schema */
const paymentSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        default: null
    },
    vip: {
        type: Schema.Types.ObjectId,
        ref: "Vip",
        default: null
    },
    resNumber: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

/** define collection indexes */
paymentSchema.index({hashId: 1});
paymentSchema.index({user: 1});
paymentSchema.index({paymentStatus: 1});

/** initialize mongoose paginate plugin for payment schema */
paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', paymentSchema);