/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import user access manager middleware */
const {userAccessManager: UAM} = require("../../../middleware/userAccessManager");

/** import controllers */
const commentsController = require("../../../controllers/public/commentsController");

/** new comment process route */
router.post('/', UAM, commentsController.newCommentProcess);

module.exports = router;