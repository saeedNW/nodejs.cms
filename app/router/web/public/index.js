/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import user access manager middleware */
const {userAccessManager: UAM} = require("../../../middleware/userAccessManager");

/** import home router */
const homeRouter = require('./home');
/** import authentication router */
const authRouter = require('./auth');
/** import courses router */
const coursesRouter = require('./courses');
/** import episodes router */
const episodesRouter = require('./episodes');
/** import comments router */
const commentsRouter = require('./comments');
/** import payment router */
const paymentRouter = require('./payment');

/** initialize home router */
router.use(homeRouter);
/** initialize authentication router */
router.use("/auth", authRouter);
/** initialize courses router */
router.use("/courses", coursesRouter);
/** initialize episodes router */
router.use("/episodes", episodesRouter);
/** initialize comments router */
router.use("/comments", UAM, commentsRouter);
/** initialize payment router */
router.use("/payment", UAM, paymentRouter);

module.exports = router;