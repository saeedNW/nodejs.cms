/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: undefined
    },
    episode: {
        type: Schema.Types.ObjectId,
        ref: 'Episode',
        default: undefined
    },
    comment: {
        type: String,
        required: true
    }
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
commentSchema.index({hashId: 1});
commentSchema.index({course: 1});
commentSchema.index({episode: 1});

/** initialize mongoose paginate plugin for courses schema */
commentSchema.plugin(mongoosePaginate);

/**
 * create a virtual field to be used for
 * collections relation through populate method.
 */
commentSchema.virtual('answers', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parent'
})

const commentBelong = doc => {
    if (doc.course)
        return "Course"
    else if (doc.episode)
        return "Episode"
}

commentSchema.virtual('belongTo', {
    ref: commentBelong,
    localField: doc => commentBelong(doc).toLowerCase(),
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Comment', commentSchema);