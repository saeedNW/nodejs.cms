/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define course collection schema */
const episodeSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    course: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    },
    title: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    episodeUrl: {
        type: String,
        required: true
    },
    episodeNumber: {
        type: Number,
        required: true
    },
    time: {
        type: String,
        default: "00:00:00"
    },
    downloadCount: {
        type: Number,
        default: 0
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

/** define collection indexes */
episodeSchema.index({hashId: 1});

/** initialize mongoose paginate plugin for courses schema */
episodeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("episode", episodeSchema);