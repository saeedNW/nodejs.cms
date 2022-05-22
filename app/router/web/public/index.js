/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import home router */
const homeRouter = require('./home');
/** import authentication router */
const authRouter = require('./auth');
/** import courses router */
const coursesRouter = require('./courses');

/** initialize home router */
router.use(homeRouter);
/** initialize authentication router */
router.use("/auth", authRouter);
/** initialize courses router */
router.use("/courses", coursesRouter);

module.exports = router;