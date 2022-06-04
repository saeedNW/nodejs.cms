/** import mongoose */
const mongoose = require('mongoose');
/** extract schema method from mongoose module */
const {Schema} = mongoose;
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');

/** define category collection schema */
const permissionSchema = new Schema({
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
    label: {
        type: String,
        required: true,
        unique: true
    },
}, {timestamps: true});

/** define collection indexes */
permissionSchema.index({hashId: 1});

/** initialize mongoose paginate plugin for category schema */
permissionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Permission', permissionSchema);