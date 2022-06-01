/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import user access manager middleware */
const {userAccessManager: UAM} = require("../../../middleware/userAccessManager");

/** import controllers */
const coursesController = require("../../../controllers/public/coursesController");

/** courses page route */
router.get('/', coursesController.index);

/** course payment route */
router.post("/payment", UAM, coursesController.paymentProcess)

/** single course page route */
router.get('/:slug', coursesController.singleCourse);

module.exports = router;