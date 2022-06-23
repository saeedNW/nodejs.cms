/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const paymentController = require("../../../controllers/public/paymentController");

/** course payment route */
router.post("/course", paymentController.coursePaymentProcess);

/** vip charge payment route */
router.post("/vip", paymentController.vipPaymentProcess);

/** payment callback route */
router.get("/checker", paymentController.paymentChecker);


module.exports = router;