/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const episodesController = require("../../../controllers/admin/episodesController");

/** home page route */
router.get('/', episodesController.index);

/** new episode form route */
router.get("/create", episodesController.newEpisodeForm);
/** new episode process route */
router.post("/create", episodesController.newEpisodeProcess);

/** episode removal process route */
router.delete("/delete/:_id", episodesController.deleteEpisodeProcess);

module.exports = router;