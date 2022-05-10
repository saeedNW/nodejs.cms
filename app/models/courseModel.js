/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose

/** define course collection schema */
const CourseSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    paymentType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        required: true
    },
    time: {
        type: String,
        default: "00:00:00"
    },
    viewCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
}, {timestamps: true});

module.exports = mongoose.model("course", CourseSchema);