/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

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
        type: Schema.Types.Mixed,
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

/** initialize mongoose paginate plugin for courses schema */
CourseSchema.plugin(mongoosePaginate);

/** courses schema pre save method */
CourseSchema.pre("save", function (next) {

    let course = this;

    /**
     * continue save/update process if the course slug didn't change.
     * return next if slug was not modified.
     */
    if (!course.isModified("slug")) return next();


    /**
     * continue save/update process if the course slug has benn changed.
     * change course slug if slug was modified.
     */
    course.slug = `/courses/${this.slug}`;
    next();
});

module.exports = mongoose.model("course", CourseSchema);