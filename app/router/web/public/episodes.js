/** import express module */
const express = require('express');
/** create express Router instance */
const router = express.Router();

/** import controllers */
const episodesController = require("../../../controllers/public/episodesController");

/** episode download process */
router.get("/download", episodesController.downloadProcess);
/** episode download link */
router.get("/download/:episode", episodesController.downloadEpisode);

module.exports = router;