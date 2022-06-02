/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const paymentsController = require("../../../controllers/user/paymentsController");

/** user panel home page route */
router.get('/', paymentsController.index);

module.exports = router;