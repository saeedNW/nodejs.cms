/** import validator module */
const validator = require('validator');

/**
 * this method is used to escape and trim user's inputs
 * @param req
 * @param items
 */
exports.escapeAndTrim = (req, items = []) => {
    if (items.length === 0)
        items = Object.keys(req.body);

    for (const item of items) {
        req.body[item] = validator.escape(req.body[item]);
        req.body[item] = validator.trim(req.body[item]);
    }
}