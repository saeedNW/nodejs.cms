/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import layout changer function */
const {changeDefaultLayout} = require("../../../config/viewEngineConfig");
/** define new view layout for admin panel router */
changeDefaultLayout(router, "./layouts/adminLayout");

/** import admin panel router */
const homeRouter = require('./home');
/** import courses manager router */
const coursesRouter = require("./courses");
/** import episodes manager router */
const episodesRouter = require("./episodes");
/** import comments manager router */
const commentsRouter = require("./comments");
/** import categories manager router */
const categoriesRouter = require("./categories");
/** import users manager router */
const usersRouter = require("./users");
/** import permissions manager router */
const permissionsRouter = require("./permissions");
/** import roles manager router */
const rolesRouter = require("./roles");

/** initialize admin panel router */
router.use(homeRouter);
/** initialize courses manager router */
router.use("/courses", coursesRouter);
/** initialize episodes manager router */
router.use("/episodes", episodesRouter);
/** initialize comments manager router */
router.use("/comments", commentsRouter);
/** initialize categories manager router */
router.use("/categories", categoriesRouter);
/** initialize users manager router */
router.use("/users", usersRouter);
/** initialize permissions manager router */
router.use("/permissions", permissionsRouter);
/** initialize users manager router */
router.use("/roles", rolesRouter);

module.exports = router;