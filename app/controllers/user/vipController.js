/** import models */
const {vipModel} = require("../../models").model

/** import main controller file */
const Controller = require("../controller");

class VipController extends Controller {
    /**
     * rendering user vip account management page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        try {
            /** get active vip types from database */
            const vipTypes = await vipModel.find({status: true});

            res.render("user/vip", {
                title: "پنل کاربری",
                vipTypes
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new VipController();