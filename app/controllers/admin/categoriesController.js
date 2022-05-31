/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../core/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {categoryModel} = require("../../models").model;
/** import new episode creation validator */
const {categoryValidator} = require("./validator/categoriesValidator");

/** import main controller class */
const Controller = require("../controller");

class CategoriesController extends Controller {
    /**
     * rendering categories index page
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
             * getting all categories from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const categories = await categoryModel.paginate({}, {
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
                sort: {createdAt: 1},
                /**
                 * populate option:
                 * Paths which should be populated with other documents
                 */
                populate: [
                    {
                        path: "parent"
                    }
                ]
            })


            /** rendering categories page */
            res.render("admin/categories/index", {
                title: "دسته بندی ها",
                categories
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new category creation page
     * @param req
     * @param res
     * @param next
     */
    async newCategoryForm(req, res, next) {
        try {
            /** get main categories name */
            const categories = await categoryModel.find({parent: null}, {name: 1});

            res.render("admin/categories/create", {title: "افزودن دسته بندی جدید", categories});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new category process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newCategoryProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.categoryValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new category */
            await this.createCategory(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new category creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async categoryValidation(req) {
        try {
            /**
             * create custom feed for user inputs validation.
             * this feed contains request body, method and query.
             * @type {*&{_method: *, _id}}
             */
            const validationFields = {
                ...req.body,
                _method: req.query._method,
                _id: req.params._id
            }

            /** user input validation */
            await categoryValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            console.log(err)

            /** get validation errors */
            const errors = err.errors;

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    /**
     * create new category
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createCategory(req, res, next) {
        try {
            /** generate new course hash id */
            const hashId = await getHashId(identifierModels.category.modelName);

            /**
             * set category parent to null if it wasn't
             * chose as a child category by user
             */
            req.body.parent = req.body.parent !== "none" ? req.body.parent : null

            /** save new course in database */
            await categoryModel.create({...req.body, hashId});

            /** return user to the courses main page */
            res.redirect("/admin/panel/categories");
        } catch (err) {
            next(err);
        }
    }

    /**
     * category removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteCategoryProcess(req, res, next) {
        /** extract category id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read episode data from database based on _id */
            const category = await categoryModel.findById(_id).populate("childes");

            /** return error if episode was not found */
            if (!category)
                this.sendError("چنین دسته ای ای وجود ندارد", 404);


            /** process if there were any childes for chosen category */
            if (category.childes.length > 0) {
                /** loop over comment answers */
                for (const child of category.childes) {
                    /** removing the child */
                    await categoryModel.findByIdAndDelete(child._id);
                }
            }

            /**
             * deleting episode from database
             */
            await category.remove();

            /** redirect to episodes index page */
            res.redirect("/admin/panel/categories");
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering edit category page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editCategoryForm(req, res, next) {
        /** extract category id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read category data from database based on _id */
            const category = await categoryModel.findById(_id);


            /** return error if course was not found */
            if (!category)
                this.sendError("چنین جلسه ای وجود ندارد", 404);

            /** get main categories name */
            const categories = await categoryModel.find({parent: null}, {name: 1});

            /** rendering courses page */
            res.render("admin/categories/edit", {
                title: "ویرایش دسته بندی",
                category,
                categories
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit category process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editCategoryProcess(req, res, next) {
        /** extract category id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read category data from database based on _id */
            const category = await categoryModel.findById(_id);

            /** return error if category was not found */
            if (!category)
                this.sendError("چنین دسته ای وجود ندارد", 404);

            /** user input validation */
            const validationResult = await this.categoryValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /**
             * set category parent to null if it wasn't
             * chose as a child category by user
             */
            req.body.parent = req.body.parent !== "none" ? req.body.parent : null

            /** update course in database */
            await categoryModel.findByIdAndUpdate(_id, {...req.body});

            /** return user to the courses main page */
            res.redirect("/admin/panel/categories");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CategoriesController();