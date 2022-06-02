/** import main controller file */
const Controller = require("../controller");

class HomeController extends Controller {
    /**
     * rendering user panel home page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        try {
            res.render("user/index", {title: "پنل کاربری"});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new HomeController();