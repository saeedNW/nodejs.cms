/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import home router */
const homeRouter = require('./home');
/** import payments router */
const paymentsRouter = require('./payments');

/** initialize home router */
router.use(homeRouter);
/** initialize payments router */
router.use('/payments', paymentsRouter);

module.exports = router;