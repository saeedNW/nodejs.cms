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
/** import path module */
const path = require("path");
/** import sharp module */
const sharp = require("sharp");

/** import course transformer class */
const CoursesTransform = require("../../transform/coursesTransform");

/** import main controller class */
const Controller = require("../controller");

class CoursesController extends Controller {
    /**
     * rendering courses index page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 10;

        try {
            /**
             * getting all courses from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const courses = await courseModel.paginate({}, {
                /**
                 * page option:
                 * this option define the requested page. and originally
                 * receives from request query
                 */
                page,
                /**
                 * limit option:
                 * this option define how many items should be in each page.
                 * it originally receives from request query
                 */
                limit,
                /**
                 * sort option:
                 * this options allows you to sort data before receiving them from database.
                 */
                sort: {createdAt: 1}
            })

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withPaginate().transformCollection(courses);

            /** rendering courses page */
            res.render("admin/courses/index", {
                title: "مدیریت دوره ها",
                courses: transformedData
            });
        } catch (err) {
            console.log(err)
            const error = new Error("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
            error.status = 500
            error.pageLoad = true
            next(error);
        }
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

            /**
             * image uploader.
             * use createImageURL method if you planed to use only one original uploaded image.
             * use imageResize method if you planed to create multiply images from uploaded image.
             */
            this.imageResize(req, next);
            // this.createImageURL(req, next);

            /** create new course */
            await this.createCourse(req, res, next);
        } catch (err) {
            console.log(err)
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
            console.log(err)
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
            console.log(err)
            res.status(err.status).json({...err.message});
        }
    }

    /**
     * create uploaded image URL
     * @param req
     * @param next
     * @param {boolean} multiImages set this to true if you want to create multiply images from original image
     * @param imageName image name for multiply images
     */
    createImageURL(req, next, multiImages = false, imageName = null) {
        try {
            /** extract file from request file */
            let file = req.file;

            /**
             * extract image info from file.
             * use for multiply images creation process
             * @type {ParsedPath}
             */
            const imageInfo = path.parse(file.path);

            /**
             * set images URL in request body.
             * if you need only one original uploaded image
             */
            if (!multiImages)
                return req.body.images = file.path.slice(6);

            /**
             * return image URL.
             * if you planed to use multiply images
             * EX => /uploads/images/.../2022/5/12/imageOriginalName-720.png
             */
            return `${imageInfo.dir.slice(6)}/${imageName}`;
        } catch (err) {
            console.log(err);
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * multiply images creation process
     * @param req
     * @param next
     */
    imageResize(req, next) {
        try {
            /** extract file from request file */
            const file = req.file

            /**
             * extract image info from file.
             * use for multiply images creation
             * @type {ParsedPath}
             */
            const imageInfo = path.parse(file.path);

            /**
             * this object will be used to save multiply images addresses
             * @type {any}
             */
            let imagesAddress = {};

            /**
             * add original image URL to imagesAddress object
             * @type {*|string}
             */
            imagesAddress.orginal = this.createImageURL(req, next, true, file.filename);

            /**
             * creating multiply files from original file.
             * new files resolution will be coming from environment variable.
             * default resolutions are 1080, 720 and 480.
             */
            JSON.parse(process.env.IMAGES_SIZE).map(async (size) => {
                /**
                 * set image name.
                 * EX => imageOriginalName-720.png
                 * @type {string}
                 */
                let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`;

                /**
                 * add new image URL to imagesAddress object.
                 * EX => /uploads/images/.../2022/5/12/imageOriginalName-720.png
                 * @type {*|string}
                 */
                imagesAddress[size] = this.createImageURL(req, next, true, imageName);

                /**
                 * resize original uploaded image to given resolution
                 * and upload new image
                 */
                await sharp(file.path)
                    .resize(size, null)
                    .toFile(`${file.destination}/${imageName}`)
            })

            /**
             * set imagesAddress object in request body
             */
            req.body.images = imagesAddress;

            /**
             * set 480p image as thumbnail in request body
             */
            req.body.thumbnail = imagesAddress[480];
        } catch (err) {
            console.log(err)
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * course removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteCourseProcess(req, res, next) {
        /** extract course id from request params */
        const {_id} = req.params

        try {
            const course = await courseModel.findById(_id);

            if (!course) {
                return res.json("چنین دوره ای وجود ندارد")
            }

            /** todo@ delete course episodes */

            /** get course image addresses as na array */
            const images = Object.values(course.images);

            /**
             * loop over images addresses.
             * deleting course images
             */
            for (const image of images) {
                fs.unlinkSync(`./public${image}`);
            }

            /**
             * deleting course from database
             */
            await course.remove();

            /** redirect to courses index page */
            res.redirect("/admin/panel/courses");
        } catch (err) {
            console.log(err)
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }
}

module.exports = new CoursesController();