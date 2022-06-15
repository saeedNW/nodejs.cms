/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const categoriesController = require("../../../controllers/admin/categoriesController");

/** home page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showCategories]),
    categoriesController.index);

/** new category form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addCategories]),
    categoriesController.newCategoryForm);

/** new category process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addCategories]),
    categoriesController.newCategoryProcess);

/** category removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteCategories]),
    categoriesController.deleteCategoryProcess);

/** edit category form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editCategories]),
    categoriesController.editCategoryForm);

/** edit category process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editCategories]),
    categoriesController.editCategoryProcess);

module.exports = router;