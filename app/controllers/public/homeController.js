/** import main controller file */
const Controller = require("../controller")

class HomeController extends Controller {
    /**
     * rendering home page
     * @param req
     * @param res
     * @param next
     */
    index(req, res, next) {
        res.render("public/index", {title: "صفحه اصلی"});
    }
}

module.exports = new HomeController();