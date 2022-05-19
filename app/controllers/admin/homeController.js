/** import main controller file */
const Controller = require("../controller")

class HomeController extends Controller {
    /**
     * rendering admin panel page
     * @param req
     * @param res
     * @param next
     */
    index(req, res, next) {
        try {
            res.render("admin/index", {title: "پنل مدیریت"});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new HomeController();