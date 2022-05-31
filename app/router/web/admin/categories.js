/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const categoriesController = require("../../../controllers/admin/categoriesController");

/** home page route */
router.get('/', categoriesController.index);

/** new category form route */
router.get("/create", categoriesController.newCategoryForm);
/** new category process route */
router.post("/create", categoriesController.newCategoryProcess);

/** category removal process route */
router.delete("/delete/:_id", categoriesController.deleteCategoryProcess);

/** edit category form route */
router.get("/edit/:_id", categoriesController.editCategoryForm);
/** edit category process route */
router.put("/edit/:_id", categoriesController.editCategoryProcess);

module.exports = router;