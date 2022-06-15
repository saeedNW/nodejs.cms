/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();
/** import permission guard middleware */
const {permissionGuard} = require("../../../middleware/permissionGuard");
/** import permission constant */
const {permissionsConstants} = require("../../../constants");

/** import controllers */
const episodesController = require("../../../controllers/admin/episodesController");

/** home page route */
router.get('/',
    permissionGuard([permissionsConstants.AccessPermissions.showEpisodes]),
    episodesController.index);

/** new episode form route */
router.get("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addEpisodes]),
    episodesController.newEpisodeForm);

/** new episode process route */
router.post("/create",
    permissionGuard([permissionsConstants.AccessPermissions.addEpisodes]),
    episodesController.newEpisodeProcess);

/** episode removal process route */
router.delete("/delete/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.deleteEpisodes]),
    episodesController.deleteEpisodeProcess);

/** edit episode form route */
router.get("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editEpisodes]),

    episodesController.editEpisodeForm);
/** edit episode process route */
router.put("/edit/:_id",
    permissionGuard([permissionsConstants.AccessPermissions.editEpisodes]),
    episodesController.editEpisodeProcess);

module.exports = router;