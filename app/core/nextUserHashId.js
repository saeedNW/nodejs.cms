/** import mongoose */
const mongoose = require('mongoose');
/** import identifierModels from identifier constant */
const {identifierModels} = require("../constants").identifierConstants;
/** import identifierModel from models */
const {identifierModel} = require("../models").model;
/** import random method from lodash module */
const {random} = require("lodash");

/**
 * get new user random hash id from identifier collection
 * @returns {Promise<any>}
 */
exports.nextUserHashId = async () => {
    let doc = null;
    let totalTries = 3;
    while (doc === null && totalTries-- > 0) {
        const modelNumber = random(0, identifierModels.users.total);

        doc = await identifierModel.findOneAndUpdate(
            {
                model: `users-${modelNumber}`,
                remained: {
                    $gt: 0
                }
            }, {
                $inc: {
                    count: mongoose.Types.Long.fromNumber(1),
                    remained: -1
                }
            }
        );
    }

    /**
     * get the first document with reminded ids greater than 0, if
     * after 3 tries no document has been found
     */
    if (doc === null) {
        doc = await identifierModel.findOneAndUpdate(
            {
                model: {
                    $regex: /^users/
                },
                remained: {
                    $gt: 0
                }
            }, {
                $inc: {
                    count: mongoose.Types.Long.fromNumber(1),
                    remained: -1
                }
            });
    }

    return doc.count.toString();
}