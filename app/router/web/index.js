/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import admin access manager middleware */
const {adminAccessManager: AAM} = require("../../middleware/adminAccessManager");
/** import user access manager middleware */
const {userAccessManager: UAM} = require("../../middleware/userAccessManager");

/** import and initialize user language cookie manager */
const {changeLanguage} = require("../../config/localizationConfig");
router.get('/language/:language', changeLanguage);

/** import and initialize home router */
const publicRouter = require('./public');
router.use('/', publicRouter);

/** import and initialize admin router */
const adminRouter = require('./admin');
router.use('/admin/panel', AAM, adminRouter);

/** import and initialize user router */
const userRouter = require('./user');
router.use('/user/panel', UAM, userRouter);

module.exports = router;