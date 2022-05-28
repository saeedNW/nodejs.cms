/** import autoBind module */
const autoBind = require("auto-bind");


/**
 * main transform class
 */
module.exports = class Config {
    constructor() {
        autoBind(this);
    }
}