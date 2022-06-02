/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const commentsController = require("../../../controllers/public/commentsController");

/** new comment process route */
router.post('/', commentsController.newCommentProcess);

module.exports = router;