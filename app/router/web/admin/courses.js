/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const coursesController = require("../../../controllers/admin/coursesController");

/** import image uploader middleware */
const imageUploader = require("../../../middleware/imageUploader");

/** home page route */
router.get('/', coursesController.index);

/** new course form route */
router.get('/create', coursesController.newCourseForm);
/** new course process route */
router.post('/create', imageUploader.single("images"), coursesController.newCourseProcess);

/** check course slug existence */
router.post('/slug/existence', coursesController.slugExistence);


module.exports = router;