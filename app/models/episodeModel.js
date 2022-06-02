/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');
/** import episodes constants */
const {episodesConstants} = require("../constants");
/** import bcryptjs */
const bcrypt = require("bcryptjs");

/** define episode collection schema */
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
    viewCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
episodeSchema.index({hashId: 1});
episodeSchema.index({episodeNumber: 1});

/** initialize mongoose paginate plugin for episodes schema */
episodeSchema.plugin(mongoosePaginate);

/**
 * increase counter fields
 * @param field
 * @param count
 * @return {Promise<void>}
 */
episodeSchema.methods.increase = async function (field, count = 1) {
    this[field] += count
    await this.save();
}

/**
 * create episode secure download link
 * @param req
 * @return {string|string}
 */
episodeSchema.methods.episodeDownload = function (req) {
    if (!req.isAuthenticated()) return "#"

    let status = false;

    if (this.paymentType === episodesConstants.PaymentType.free)
        status = true;
    else if (this.paymentType === episodesConstants.PaymentType.vip)
        status = req.user.isVip();
    else if (this.paymentType === episodesConstants.PaymentType.cash)
        status = req.user.haveBought(this.course);

    if (!status) return "#"

    const timestamp = new Date().getTime() + 12 * 3600 * 1000;

    let secretMac = `${process.env.EPISODE_SECRET_MAC}${this._id}${timestamp}${req.user._id}`;

    secretMac = bcrypt.hashSync(secretMac, 15);

    return `/episodes/download/${this._id}?mac=${secretMac}&t=${timestamp}`;
}

/**
 * create a virtual field to be used for
 * course and comments collections relation
 * through populate method.
 */
episodeSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "episode",
});

module.exports = mongoose.model("Episode", episodeSchema);