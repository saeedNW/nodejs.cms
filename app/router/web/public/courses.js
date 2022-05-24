/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const coursesController = require("../../../controllers/public/coursesController");

/** courses page route */
router.get('/', coursesController.index);

/** single course page route */
router.get('/:slug', coursesController.singleCourse);

/** episode download link */
router.get("/download/:episode", coursesController.downloadProcess);

module.exports = router;