/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const homeController = require("../../../controllers/public/homeController");

/** home page route */
router.get('/', homeController.index);

/** about us page route */
router.get('/about-us', homeController.aboutUs);

module.exports = router;