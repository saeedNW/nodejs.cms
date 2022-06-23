/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const vipController = require("../../../controllers/user/vipController");

/** user panel vip page route */
router.get("/", vipController.index);

module.exports = router;