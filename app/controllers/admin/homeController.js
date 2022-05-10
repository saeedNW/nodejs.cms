/** import main controller file */
const Controller = require("../controller")

class HomeController extends Controller {
    /**
     * rendering admin panel page
     * @param req
     * @param res
     */
    index(req, res) {
        res.render("admin/index", {title: "پنل مدیریت"});
    }
}

module.exports = new HomeController();