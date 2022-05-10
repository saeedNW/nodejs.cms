/** import mongoose */
const mongoose = require('mongoose');
/** import mongoose-long*/
require('mongoose-long')(mongoose);
/** config mongoose Long type */
const {Types: {Long}} = mongoose;

/** define identifier collection schema */
const identifierSchema = new mongoose.Schema({
    count: {
        type: Long,
        default: Long.fromNumber(10000),
    },
    model: {
        type: String,
        required: true,
    },
    remained: {
        type: Number
    }
});

/** define collection indexes */
identifierSchema.index({model: 1, count: 1}, {unique: true, required: true, index: -1});

module.exports = mongoose.model('Identifier', identifierSchema);
