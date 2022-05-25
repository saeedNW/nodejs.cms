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

/**
 * create episode secure download link
 * @param auth
 * @param canUserUse
 * @return {string|string}
 */
episodeSchema.methods.episodeDownload = function (auth, canUserUse) {
    if (!auth.loginCheck) return "#"

    let status = false;

    if (this.paymentType === episodesConstants.PaymentType.free)
        status = true;
    else if (this.paymentType === episodesConstants.PaymentType.vip || this.paymentType === episodesConstants.PaymentType.cash)
        status = canUserUse;

    if (!status) return "#"

    const timestamp = new Date().getTime() + 12 * 3600 * 1000;

    let secretMac = `${process.env.EPISODE_SECRET_MAC}${this._id}${timestamp}${auth.user._id}`;

    secretMac = bcrypt.hashSync(secretMac, 15);

    return `/episodes/download/${this._id}?mac=${secretMac}&t=${timestamp}`;
}

module.exports = mongoose.model("Episode", episodeSchema);