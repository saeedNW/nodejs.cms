/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import layout changer function */
const {changeDefaultLayout} = require("../../../config/initViewEngine");
/** define new view layout for admin panel router */
changeDefaultLayout(router, "./layouts/adminLayout");

/** import admin panel router */
const homeRouter = require('./home');
/** import courses manager router */
const coursesRouter = require("./courses");

/** initialize admin panel router */
router.use(homeRouter);
/** initialize courses manager router */
router.use("/courses", coursesRouter);

module.exports = router;