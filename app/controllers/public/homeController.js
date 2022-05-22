/** import main controller file */
const Controller = require("../controller");
/** import courses transform */
const CoursesTransform = require("../../transform/coursesTransform");
/** import models */
const {courseModel} = require("../../models").model;

class HomeController extends Controller {
    /**
     * rendering home page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        try {
            /** get 8 latest courses info from database */
            const courses = await courseModel.find({}).sort({createdAt: -1}).limit(8);

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withFullSlug().withFullInfo().transformCollection(courses);

            res.render("public/index", {title: "صفحه اصلی", courses: transformedData});
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering about us page
     * @param req
     * @param res
     */
    aboutUs(req, res) {
        res.render("public/aboutUs", {title: "درباره ما"});
    }
}

module.exports = new HomeController();