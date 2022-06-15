/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const rolesController = require("../../../controllers/admin/rolesController");

/** home page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showRoles]),
    rolesController.index);

/** new permission form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addRoles]),
    rolesController.newRoleForm);

/** new episode process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addRoles]),
    rolesController.newRoleProcess);

/** episode removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteRoles]),
    rolesController.deleteRoleProcess);

/** edit episode form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editRoles]),
    rolesController.editRoleForm);

/** edit episode process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editRoles]),
    rolesController.editRoleProcess);

module.exports = router;