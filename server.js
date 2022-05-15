/** import dotenv module */
const dotenv = require('dotenv');

/** initialize dotenv module */
dotenv.config();

/** import application main file */
const Application = require("./app/app");

/** initialize application */
new Application();