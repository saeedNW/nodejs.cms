/** import user model */
const userModel = require("./userModel");
/** import identifier model */
const identifierModel = require("./identifierModel");
/** import account recovery model */
const accountRecoveryModel = require("./accountRecoveryModel");
/** import course model */
const courseModel = require("./courseModel");
/** import episodes model */
const episodeModel = require("./episodeModel");
/** import comments model */
const commentModel = require("./commentModel");
/** import category model */
const categoryModel = require("./categoryModel");
/** import payment model */
const paymentModel = require("./paymentModel");
/** import permission model */
const permissionModel = require("./permissionModel");
/** import role model */
const roleModel = require("./roleModel");
/** import vip model */
const vipModel = require("./vipModel");

exports.model = {
    userModel,
    identifierModel,
    accountRecoveryModel,
    courseModel,
    episodeModel,
    commentModel,
    categoryModel,
    paymentModel,
    permissionModel,
    roleModel,
    vipModel
}