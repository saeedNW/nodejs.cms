/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const usersController = require("../../../controllers/admin/usersController");

/** home page route */
router.get('/', usersController.index);

/** new user form route */
router.get("/create", usersController.newUserForm);
/** new user process route */
router.post("/create", usersController.newUserProcess);

/** user removal process route */
router.delete("/delete/:_id", usersController.deleteUserProcess);

/** edit user form route */
router.get("/edit/:_id", usersController.editUserForm);
/** edit user process route */
router.put("/edit/:_id", usersController.editUserProcess);

/** toggle user admin access process route */
router.patch("/toggle-admin/:_id", usersController.toggleAdminAccess);

module.exports = router;