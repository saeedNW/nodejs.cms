/** import mongoose */
const mongoose = require('mongoose');
/** import identifierModel from models */
const {identifierModel} = require("../models").model;
/** import identifierModels from identifier constant */
const {identifierModels} = require("../constants").identifierConstants;

/**
 * initialize identifier collection
 * @returns {Promise<void>}
 */
exports.identifierInitializer = async () => {
    /** loop over model items in identifier constants */
    for (const model in identifierModels) {
        /** select each model */
        const modelObj = identifierModels[model];
        /** check if ids are stored in multiple docs */
        if (modelObj.isPartial) {
            /** loop over count of the docs that are storing unique ids */
            for (let i = 0; i < modelObj.total; i++) {
                /** check document existence in identifier collection */
                const exists = await identifierModel.exists({
                    model: modelObj.modelName.replace('*', i.toString()),
                });
                /** proceed if document doesn't exists */
                if (!exists) {
                    /** create new entry for current model */
                    await identifierModel.create({
                        model: modelObj.modelName.replace('*', i.toString()),
                        count: mongoose.Types.Long.fromNumber(
                            modelObj.startId + (i * modelObj.length)
                        ),
                        remained: 9999
                    });
                }
            }
        } else {
            /** check document existence in identifier collection */
            const exists = await identifierModel.exists({
                model: modelObj.modelName,
            });
            /** proceed if document doesn't exists */
            if (!exists) {
                const max = await getMaxIdInCollections(modelObj.deps);

                /** create new entry for current model */
                await identifierModel.create({
                    model: modelObj.modelName,
                    count: mongoose.Types.Long.fromNumber(max)
                });
            }
        }
    }
}

/**
 * get last existence hash id in a particular collection
 * @param deps
 * @returns {Promise<number|number>}
 */
const getMaxIdInCollections = async (deps) => {
    let max = -1;
    /** loop over main models of the identifier */
    for (const depModel of deps) {
        /** get document with the highest identifier id from current collection */
        let result = await (require(`../models/${depModel}`)).findOne()
            .sort({hashId: -1}).limit(1);

        max = Math.max(max, (result && parseInt(result.hashId)) || -1);
    }
    return max + 1 < 10000 ? 10000 : max + 1;
}