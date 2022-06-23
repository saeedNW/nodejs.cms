/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const vipController = require("../../../controllers/admin/vipController");

/** vip types page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showVips]),
    vipController.index);

/** new vip type form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addVips]),
    vipController.newVipForm);

/** new vip type process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addVips]),
    vipController.newVipProcess);

/** vip type removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteVips]),
    vipController.deleteVipProcess);

/** edit vip type form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editVips]),
    vipController.editVipForm);

/** edit vip type process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editVips]),
    vipController.editVipProcess);

/** toggle vip type status process route */
router.patch("/toggle-status/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editVipStatus]),
    vipController.toggleStatus);

module.exports = router;