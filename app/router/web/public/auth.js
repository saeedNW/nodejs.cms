/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import prevent re-entry middleware */
const {preventReEntry} = require("../../../middleware/preventReEntry");

/** import controllers */
const loginController = require("../../../controllers/auth/loginController");
const registerController = require("../../../controllers/auth/registerController");
const googleController = require("../../../controllers/auth/googleController");
const accountRecoveryController = require("../../../controllers/auth/accountRecoveryController");
const resetPasswordController = require("../../../controllers/auth/resetPasswordController");


router.route("/login")
    /** login form route */
    .get(preventReEntry, loginController.loginForm)
    /** login processor route */
    .post(preventReEntry, loginController.loginProcess);

router.route("/register")
    /** register form route */
    .get(preventReEntry, registerController.registerForm)
    /** register processor route */
    .post(preventReEntry, registerController.registerProcess);


/** google login processor route */
router.get("/google", preventReEntry, googleController.process);
/** google callback route */
router.get("/google/callback", preventReEntry, googleController.callback);

/** recovery account form route */
router.get("/recovery/account", accountRecoveryController.recoveryForm);
/** recovery account email send route */
router.post("/recovery/process", accountRecoveryController.recoveryProcess);

/** reset password form route */
router.get("/reset/password/:token", resetPasswordController.resetForm);
/** reset password process */
router.post("/reset/password", resetPasswordController.resetProcess);

/** user logout processor route */
router.get("/logout", loginController.logout)

module.exports = router;
