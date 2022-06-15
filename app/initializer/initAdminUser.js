/** import user model */
const {userModel, permissionModel, roleModel} = require("../models").model;
/** import user hash id generator */
const {nextUserHashId} = require("../utils/nextUserHashId");
/** import permissions constant */
const {permissionsConstants} = require("../constants");
/** import general hashId generator method */
const {getHashId} = require("../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../constants").identifierConstants;

/**
 * initialize first admin account
 * @return {Promise<void>}
 */
exports.adminAccountInitializer = async () => {
    try {
        /** check if any admin account exists */
        const adminAccount = await userModel.findOne({admin: true});

        /** create admin account if admin account was not found */
        if (!adminAccount) {
            const adminRoleId = await this.adminRoleInitializer();


            /** generate new user hash id */
            const hashId = await nextUserHashId();

            /**
             * admin account info
             * @type {{password: *, role: *, name: string, admin: boolean, email: string}}
             */
            const adminInfo = {
                name: "مدیر کل",
                admin: true,
                email: "admin@codding.ir",
                password: process.env.DEFAULT_ADMIN_PASSWORD,
                role: adminRoleId
            }

            /** create new user */
            await userModel.create({...adminInfo, hashId});
        }
    } catch (err) {
        console.log(err)
    }
}

/**
 * initialize super admin role
 * @return {Promise<any>}
 */
exports.adminRoleInitializer = async () => {
    try {
        /** check if role already exists */
        const adminRoleExists = await roleModel.findOne({
            title: "super-admin"
        })

        if (!adminRoleExists) {
            /**
             * get full access permission info from database
             */
            const fullAccessRole = await permissionModel.findOne({
                title: permissionsConstants.AccessPermissions.fullAccess
            });

            /** generate new roles' hash id */
            const hashId = await getHashId(identifierModels.roles.modelName);

            const roleInfo = {
                title: "super-admin",
                label: "مدیر کل",
                permissions: fullAccessRole._id
            }

            /** save new roles in database */
            const adminRole = await roleModel.create({...roleInfo, hashId});

            return adminRole._id;
        }

        return adminRoleExists._id;
    } catch (err) {
        console.log(err);
    }
}