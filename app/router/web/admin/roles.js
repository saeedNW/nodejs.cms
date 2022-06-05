/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const rolesController = require("../../../controllers/admin/rolesController");

/** home page route */
router.get('/', rolesController.index);

/** new permission form route */
router.get("/create", rolesController.newRoleForm);
/** new episode process route */
router.post("/create", rolesController.newRoleProcess);

/** episode removal process route */
router.delete("/delete/:_id", rolesController.deleteRoleProcess);

/** edit episode form route */
router.get("/edit/:_id", rolesController.editRoleForm);
/** edit episode process route */
router.put("/edit/:_id", rolesController.editRoleProcess);

module.exports = router;