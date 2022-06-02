/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const homeController = require("../../../controllers/user/homeController");

/** user panel home page route */
router.get('/', homeController.index);

module.exports = router;