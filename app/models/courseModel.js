/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define course collection schema */
const courseSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    categories: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Category"
    }],
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
        type: Object,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    price: {
        type: Number,
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
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
courseSchema.index({hashId: 1});
courseSchema.index({user: 1});
courseSchema.index({paymentType: 1});
courseSchema.index({price: 1});
courseSchema.index({tags: 1});
courseSchema.index({commentCount: -1});

/** initialize mongoose paginate plugin for courses schema */
courseSchema.plugin(mongoosePaginate);

/**
 * increase counter fields
 * @param field
 * @param count
 * @return {Promise<void>}
 */
courseSchema.methods.increase = async function (field, count = 1) {
    this[field] += count
    await this.save();
}

/**
 * create a virtual field to be used for
 * course and episode collections relation
 * through populate method.
 */
courseSchema.virtual("episodes", {
    ref: "Episode",
    localField: "_id",
    foreignField: "course",
});

/**
 * create a virtual field to be used for
 * course and comments collections relation
 * through populate method.
 */
courseSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "course",
});

module.exports = mongoose.model("Course", courseSchema);