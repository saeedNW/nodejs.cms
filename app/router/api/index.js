/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import public routes */
const publicRouter = require('./public');
/** import admin routes */
const adminRouter = require('./admin');
/** import user routes */
const userRouter = require('./user');

/** initialize home router */
router.use('/', publicRouter);
/** initialize admin router */
router.use('/admin/panel', adminRouter);
/** initialize user router */
router.use('/user/panel', userRouter);

module.exports = router;