/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import new course creation validator */
const {newCourseValidator} = require("./validator/newCourseValidator");
/** import courses model */
const {courseModel} = require("../../models").model;
/** import general hashId generator method */
const {getHashId} = require("../../core/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import file system module */
const fs = require("fs");

/** import main controller file */
const Controller = require("../controller");

class CoursesController extends Controller {
    /**
     * rendering admin panel page
     * @param req
     * @param res
     */
    index(req, res) {
        res.render("admin/courses/index", {title: "مدیریت دوره ها"});
    }

    /**
     * rendering new course creation page
     * @param req
     * @param res
     */
    newCourseForm(req, res) {
        res.render("admin/courses/create", {title: "ایجاد دوره جدید"});
    }

    /**
     * new course process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newCourseProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.newCourseValidation(req);

            /**
             * remove uploaded image if there was any validation errors.
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult) {
                /** remove uploaded file if request file exists */
                if (req.file)
                    fs.unlinkSync(req.file.path);

                /** redirect to previous page */
                return this.redirectURL(req, res);
            }

            /** image uploader */
            this.createImageLink(req);

            /** create new course */
            await this.createCourse(req, res, next);
        } catch (err) {
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * validate user inputs for new course creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async newCourseValidation(req) {
        try {
            /**
             * create custom feed for user inputs validation.
             * this feed contains request body and request file infos.
             * @type {*&{images}}
             */
            const validationFields = {...req.body, images: req.file}

            /** user input validation */
            await newCourseValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            /** get validation errors */
            const errors = err.errors;

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    /**
     * create new course
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createCourse(req, res, next) {
        try {
            /** get current user ObjectId from request */
            const {_id: user} = req.user;

            /** generate new course hash id */
            const hashId = await getHashId(identifierModels.courses.modelName);

            /** save new course in database */
            await courseModel.create({...req.body, user, hashId});

            /** return user to the courses main page */
            res.redirect("/admin/panel/courses");
        } catch (err) {
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * ajax call method for checking slug existence in database
     * @param req
     * @param res
     * @return {Promise<void>}
     */
    async slugExistence(req, res) {
        try {
            /** extract slug from request body */
            const {slug} = req.body

            /** check database for same slug existence */
            const findSlug = await courseModel.findOne({slug});

            /** return error if slug already exists */
            if (findSlug)
                this.sendError("آدرس نامک تکراری می باشد", 422);

            res.json({message: "نامک قابل استفاده می باشد"});
        } catch (err) {
            res.status(err.status).json({...err.message});
        }
    }

    /**
     * set image path (link) into request body as images
     * @param req
     */
    createImageLink(req) {
        /** extract image path from request file */
        let {path} = req.file;

        /** set images path in request body */
        req.body.images = path.slice(6);
    }
}

module.exports = new CoursesController();