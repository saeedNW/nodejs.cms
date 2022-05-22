/** import main transform file */
const Transform = require("./transform");

/**
 * episodes data transformer
 */
module.exports = class UserTransform extends Transform {
    /**
     * this private variable will be used to determined
     * which user email should be hashed or not
     * @type {boolean}
     */
    #hashedEmailStatus = false;
    /**
     * this private variable will be used to determined
     * which basic info of the course is requested or not
     * @type {boolean}
     */
    #courseBasicInfo = false;
    /**
     * this private variable will be used to determined
     * which full info of the course is requested or not
     * @type {boolean}
     */
    #courseFullInfo = false

    /**
     * transforming the user data
     * @param item
     */
    transform(item) {
        return {
            _id: item._id,
            hashId: item.hashId,
            name: item.name,
            admin: item.admin,
            email: item.email,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            ...this.showHashedEmail(item),
            ...this.showCourseBasicInfo(item),
            ...this.showCourseFullInfo(item),
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which user email should be hashed or not
     */
    withHashedEmail() {
        this.#hashedEmailStatus = true;
        return this;
    }

    /**
     * return hashed email address
     * @param item
     * @return {*}
     */
    showHashedEmail(item) {
        if (this.#hashedEmailStatus) {

            let {email} = item;

            const AtIndex = email.indexOf('@');
            const startIndex = AtIndex * .2 | 0;
            const endIndex = AtIndex * .9 | 0;

            email = email.slice(0, startIndex) +
                email.slice(startIndex, endIndex).replace(/./g, '*') +
                email.slice(endIndex);

            item.email = email

            return item
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which courses basic info is requested or not
     */
    withCourseBasicInfo() {
        this.#courseBasicInfo = true;
        return this;
    }

    /**
     * return courses basic info if it was requested
     * @param item
     * @return {{courses: (?[]|{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *})}}
     */
    showCourseBasicInfo(item) {
        /** import courses transform */
        const CoursesTransform = require("./coursesTransform");

        if (this.#courseBasicInfo) {
            return {courses: new CoursesTransform().transformCollection(item.courses)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which courses full info is requested or not
     */
    withCourseFullInfo() {
        this.#courseFullInfo = true;
        return this;
    }

    /**
     * return courses full info if it was requested
     * @param item
     * @return {{courses: (?[]|{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *})}}
     */
    showCourseFullInfo(item) {
        /** import courses transform */
        const CoursesTransform = require("./coursesTransform");

        if (this.#courseFullInfo) {
            return {courses: new CoursesTransform().withFullInfo().transformCollection(item.courses)}
        }
    }
}