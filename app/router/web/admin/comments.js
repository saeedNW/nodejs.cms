/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const commentsController = require("../../../controllers/admin/commentsController");

/** index page route */
router.get('/', commentsController.index);

/** unapproved comments page route */
router.get("/unapproved", commentsController.unapproved);
/** unapproved comments approval process route */
router.put("/unapproved/:_id", commentsController.approvalProcess);

/** episode removal process route */
router.delete("/delete/:_id", commentsController.deleteCommentProcess);

module.exports = router;