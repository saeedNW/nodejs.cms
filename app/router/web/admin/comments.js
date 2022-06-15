/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const commentsController = require("../../../controllers/admin/commentsController");

/** index page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showComments]),
    commentsController.index);

/** unapproved comments page route */
router.get("/unapproved",
    permissionGuard([permissionsConstants.AccessPermissions.showUnapprovedComments]),
    commentsController.unapproved);

/** unapproved comments approval process route */
router.patch("/unapproved/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.approveComments]),
    commentsController.approvalProcess);

/** episode removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteComments]),
    commentsController.deleteCommentProcess);

module.exports = router;