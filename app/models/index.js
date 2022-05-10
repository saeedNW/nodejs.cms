/** import user model */
const userModel = require("./userModel");
/** import identifier model */
const identifierModel = require("./identifierModel");
/** import account recovery model */
const accountRecoveryModel = require("./accountRecoveryModel");
/** import course model */
const courseModel = require("./courseModel");

exports.model = {
    userModel,
    identifierModel,
    accountRecoveryModel,
    courseModel
}