/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const usersController = require("../../../controllers/admin/usersController");

/** home page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showUsers]),
    usersController.index);

/** new user form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addUsers]),
    usersController.newUserForm);

/** new user process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addUsers]),
    usersController.newUserProcess);

/** user removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteUsers]),
    usersController.deleteUserProcess);

/** edit user form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editUsers]),
    usersController.editUserForm);

/** edit user process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editUsers]),
    usersController.editUserProcess);

/** toggle user admin access process route */
router.patch("/toggle-admin/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editUsersAdminStatus]),
    usersController.toggleAdminAccess);

/** user roles manager form route */
router.get("/roles/:userId",
    permissionGuard([permissionsConstants.AccessPermissions.editUsersRoles]),
    usersController.manageRolesForm);

/** user roles manager process route */
router.patch("/roles/:userId",
    permissionGuard([permissionsConstants.AccessPermissions.editUsersRoles]),
    usersController.manageRolesProcess);

module.exports = router;