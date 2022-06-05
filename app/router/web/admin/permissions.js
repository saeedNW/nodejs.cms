/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const permissionsController = require("../../../controllers/admin/permissionsController");

/** home page route */
router.get('/', permissionsController.index);

/** new permission form route */
router.get("/create", permissionsController.newPermissionForm);
/** new episode process route */
router.post("/create", permissionsController.newPermissionProcess);

/** episode removal process route */
router.delete("/delete/:_id", permissionsController.deletePermissionProcess);

/** edit episode form route */
router.get("/edit/:_id", permissionsController.editPermissionForm);
/** edit episode process route */
router.put("/edit/:_id", permissionsController.editPermissionProcess);

module.exports = router;