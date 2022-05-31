/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import image uploader middleware */
const {imageUploader} = require("../../../middleware/imageUploader");

/** import controllers */
const homeController = require("../../../controllers/admin/homeController");

/** home page route */
router.get('/', homeController.index);

/** image uploader route */
router.post("/ckEditor-uploader", imageUploader.single("upload"), homeController.ckEditorUploader)

module.exports = router;