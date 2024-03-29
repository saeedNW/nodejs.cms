/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import course validator */
const {courseValidator} = require("./validator/courseValidator");
/** import courses model */
const {courseModel, categoryModel} = require("../../models").model;
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
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
            const transformedData = new CoursesTransform().withFullInfo().withPaginate().transformCollection(courses);


            /** rendering courses page */
            res.render("admin/courses/index", {
                title: req.t("course_index_title"),
                courses: transformedData
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new course creation page
     * @param req
     * @param res
     * @param next
     */
    async newCourseForm(req, res, next) {
        try {
            /** get categories from database */
            const categories = await categoryModel.find({}, {name: 1});

            res.render("admin/courses/create", {title: req.t("new_course_title"), categories});
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering edit course page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editCourseForm(req, res, next) {
        /** extract course id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read course data from database based on _id */
            const course = await courseModel.findById(_id);

            /** return error if course was not found */
            if (!course)
                this.sendError(req.t("course_notFound_error"), 404);

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withFullInfo().transform(course);

            /** get categories from database */
            const categories = await categoryModel.find({}, {name: 1});

            /** rendering courses page */
            res.render("admin/courses/edit", {
                title: req.t("edit_course_title"),
                course: transformedData,
                categories
            });
        } catch (err) {
            next(err);
        }
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
            const validationResult = await this.courseValidation(req);

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
            this.imageResize(req);
            // this.createImageURL(req);

            /** create new course */
            await this.createCourse(req, res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for courses
     * @param req
     * @returns {Promise<boolean>}
     */
    async courseValidation(req) {
        try {
            /**
             * create image feed for validation process
             * @type {*&{_method: *, _id}}
             */
            let images = {
                ...req.file,
                _method: req.query._method,
                _id: req.params._id
            }
            /**
             * create custom feed for user inputs validation.
             * this feed contains request body, method, query and file.
             * @type {*&{images: (*&{_method: *, _id}), _method: *, _id}}
             */
            const validationFields = {
                ...req.body,
                images,
                _method: req.query._method,
                _id: req.params._id
            }

            /** user input validation */
            await courseValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ['title', 'slug', 'paymentType', 'price', 'tags']);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            console.log(err)

            /** get validation errors */
            const errors = err.errors.map(error => req.t(error));

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
     * @return {Promise<void>}
     */
    async createCourse(req, res) {
        /** get current user ObjectId from request */
        const {_id: user} = req.user;

        /** generate new course hash id */
        const hashId = await getHashId(identifierModels.courses.modelName);

        /** save new course in database */
        await courseModel.create({...req.body, user, hashId});

        /** return user to the courses main page */
        res.redirect("/admin/panel/courses");
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
                this.sendError(req.t("course_unique_slug_error"), 422);

            res.json({message: req.t("course_slug_is_usable")});
        } catch (err) {
            res.status(err.status).json({...err.message});
        }
    }

    /**
     * create uploaded image URL
     * @param req
     * @param {boolean} multiImages set this to true if you want to create multiply images from original image
     * @param imageName image name for multiply images
     */
    createImageURL(req, multiImages = false, imageName = null) {
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
    }

    /**
     * multiply images creation process
     * @param req
     */
    imageResize(req) {
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
        imagesAddress.orginal = this.createImageURL(req, true, file.filename);

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
            imagesAddress[size] = this.createImageURL(req, true, imageName);

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
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read course data from database based on _id */
            const course = await courseModel.findById(_id).populate([
                {
                    path: "episodes",
                    populate: {
                        path: "comments",
                        populate: {
                            path: "answers"
                        }
                    }
                },
                {
                    path: "comments",
                    populate: {
                        path: "answers"
                    }
                }
            ]);

            /** return error if course was not found */
            if (!course)
                this.sendError(req.t("course_notFound_error"), 404);

            /** return error of course didn't belong to user */
            if (course.user.toString() !== req.user._id.toString())
                this.sendError(req.t("delete_not_allowed"), 403);

            /**  delete course episodes */
            if (course.episodes.length > 0)
                await this.courseEpisodeRemoval(course.episodes);

            /** delete course comments */
            if (course.comments.length > 0)
                await this.courseCommentRemoval(course.comments);

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
            next(err);
        }
    }

    /**
     * remove course episodes
     * @param episodes
     * @return {Promise<void>}
     */
    async courseEpisodeRemoval(episodes) {
        /** loop over episodes */
        for (const episode of episodes) {

            /** get episode video file absolute path */
            const episodeVideoPath = path.resolve(`./public/downloads/${episode.episodeUrl}`);

            /** remove episode video file */
            fs.unlinkSync(episodeVideoPath);

            /** remove episode comments */
            if (episode.comments.length > 0) {
                /** loop over comments */
                for (const comment of episode.comments) {
                    /** loop over answers */
                    for (const answer of comment.answers) {
                        /** removing the answer */
                        await answer.remove();
                    }

                    /**
                     * deleting comment from database
                     */
                    await comment.remove();
                }
            }

            /** remove episode from database */
            await episode.remove();
        }
    }

    /**
     * remove course comments
     * @param comments
     * @return {Promise<void>}
     */
    async courseCommentRemoval(comments) {
        /** loop over comments */
        for (const comment of comments) {
            /** loop over answers */
            for (const answer of comment.answers) {
                /** removing the answer */
                await answer.remove();
            }

            /**
             * deleting comment from database
             */
            await comment.remove();
        }
    }

    /**
     * edit course process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editCourseProcess(req, res, next) {
        /** extract course id from request params */
        const {_id} = req.params

        const {imagesThumb} = req.body

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read course data from database based on _id */
            const course = await courseModel.findById(_id);

            /** return error if course was not found */
            if (!course)
                this.sendError(req.t("course_notFound_error"), 404);

            /** return error of course didn't belong to user */
            if (course.user.toString() !== req.user._id.toString())
                this.sendError(req.t("delete_not_allowed"), 403);

            /** user input validation */
            const validationResult = await this.courseValidation(req);

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
             * course update feed
             */
            const updateObject = {}

            /** change thumbnail with selected one */
            updateObject.thumbnail = imagesThumb

            /**
             * process if user uploaded any image during course update.
             * upload multiply images.
             * use createImageURL method if you planed to use only one original uploaded image.
             * use imageResize method if you planed to create multiply images from uploaded image.
             */
            if (req.file) {
                this.imageResize(req);
                // this.createImageURL(req);
                updateObject.images = req.body.images
                updateObject.thumbnail = req.body.thumbnail
            }

            /** update course in database */
            await courseModel.findByIdAndUpdate(_id, {...req.body, ...updateObject});

            /** return user to the courses main page */
            res.redirect("/admin/panel/courses");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CoursesController();