/** import permissions list */
const permissionsList = require("./permissionsList");
/** import permission model */
const {permissionModel} = require("../models").model;
/** import general hashId generator method */
const {getHashId} = require("../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../constants").identifierConstants;

/**
 * initialize permission collection
 */
exports.permissionsInitializer = async () => {
    try {
        /** loop over permissions list */
        for (const permission of permissionsList){
            /** check permission existence */
            const permissionExists = await permissionModel.findOne({title: permission.title});

            /** create permission in database if it wasn't found */
            if (!permissionExists) {
                const hashId = await getHashId(identifierModels.permissions.modelName);

                await permissionModel.create({...permission, hashId});
            }
        }
    } catch (err) {
        console.log(err)
    }
}