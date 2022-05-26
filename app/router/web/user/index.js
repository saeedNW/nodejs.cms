/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import comments router */
const commentsRouter = require('./comments');

/** initialize comments router */
router.use("/comments", commentsRouter);

module.exports = router;