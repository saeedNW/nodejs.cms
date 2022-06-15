/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import image uploader middleware */
const {imageUploader} = require("../../../middleware/imageUploader");
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const coursesController = require("../../../controllers/admin/coursesController");

/** home page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showCourses]),
    coursesController.index);

/** new course form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addCourses]),
    coursesController.newCourseForm);

/** new course process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addCourses]),
    imageUploader.single("images"), coursesController.newCourseProcess);

/** course removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteCourses]),
    coursesController.deleteCourseProcess);

/** edit course form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editCourses]),
    coursesController.editCourseForm);

/** edit course process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editCourses]),
    imageUploader.single("images"), coursesController.editCourseProcess);

/** check course slug existence */
router.post('/slug/existence',
    permissionGuard([permissionsConstants.AccessPermissions.addCourses]),
    coursesController.slugExistence);


module.exports = router;