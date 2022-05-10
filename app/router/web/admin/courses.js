/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const coursesController = require("../../../controllers/admin/coursesController");

/** home page route */
router.get('/', coursesController.index);

/** new course form route */
router.get('/create', coursesController.newCourseForm);
/** new course process route */
router.post('/create', coursesController.newCourseProcess);

/** check course slug existence */
router.post('/slug/existence', coursesController.slugExistence);


module.exports = router;