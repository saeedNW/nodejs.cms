/** import mongoose */
const mongoose = require('mongoose');
/** import identifierModel from models */
const {identifierModel} = require("../models").model;

/**
 * get next hash id from selected model collection
 * @param modelName model name
 * @param incAmount
 * @returns {Promise<any>}
 */
exports.getHashId = async (modelName, incAmount = 1) => {
    const doc = await identifierModel.findOneAndUpdate(
        {
            model: modelName
        }, {
            $inc: {
                count: mongoose.Types.Long.fromNumber(incAmount)
            }
        });
    return doc.count.toString();
}