/** import main transform file */
const Transform = require("./transform");
const UserTransform = require("./userTransform");
const CoursesTransform = require("./coursesTransform");
const EpisodesTransform = require("./episodesTransform");

/**
 * episodes data transformer
 */
module.exports = class CommentsTransform extends Transform {
    /**
     * this private variable will be used to determined
     * which info of the user is requested or not
     * @type {boolean}
     */
    #userInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the parent comment is requested or not
     * @type {boolean}
     */
    #parentInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the course is requested or not
     * @type {boolean}
     */
    #courseInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the episodes is requested or not
     * @type {boolean}
     */
    #episodeInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the answer comments is requested or not
     * @type {boolean}
     */
    #answersInfo = false;

    /**
     * transforming the user data
     * @param item
     */
    transform(item) {
        return {
            _id: item._id,
            hashId: item.hashId,
            approved: item.approved,
            comment: item.comment,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            ...this.showUserInfo(item),
            ...this.showParentInfo(item),
            ...this.showCourseInfo(item),
            ...this.showEpisodeInfo(item),
            ...this.showAnswersInfo(item),
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which user info is requested or not
     */
    withUserInfo() {
        this.#userInfo = true;
        return this;
    }

    /**
     * return user info if it was requested
     * @param item
     * @return {{user: {[p: string]: *}}}
     */
    showUserInfo(item) {
        /** import user transform */
        const UserTransform = require("./userTransform");

        if (this.#userInfo) {
            return {user: new UserTransform().withHashedEmail().transform(item.user)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which parent comment info is requested or not
     */
    withParentInfo() {
        this.#parentInfo = true;
        return this;
    }

    /**
     * return parent comment info if it was requested
     * @param item
     * @return {{parent: (*&{createdAt: (number|boolean|string|*), approved: ({default: boolean, type: Boolean | BooleanConstructor}|*), comment, _id, hashId, user: {[p: string]: *}, updatedAt: *})}}
     */
    showParentInfo(item) {
        if (this.#parentInfo) {
            return {parent: new CommentsTransform().withUserInfo().withAnswers().transform(item.parent)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which course info is requested or not
     */
    withCourseInfo() {
        this.#courseInfo = true;
        return this;
    }

    /**
     * return course info if it was requested
     * @param item
     * @return {{images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, commentCount: *, tags, createdAt: *, price: (number|*), _id: *, viewCount: *, time, user, slug: *, updatedAt: *}}
     */
    showCourseInfo(item) {
        if (item.course) {
            /** import courses transform */
            const CoursesTransform = require("./coursesTransform");

            if (this.#courseInfo)
                return {course: new CoursesTransform().transform(item.course)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which episode info is requested or not
     */
    withEpisodeInfo() {
        this.#episodeInfo = true;
        return this;
    }

    /**
     * return episode info if it was requested
     * @param item
     * @return {{episode: {images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, episodeNumber: ({type: (Number|NumberConstructor), required: boolean}|*), commentCount: *, tags, paymentType: (number|*), createdAt: *, episodeLink: string, price: (number|*), _id: *, time, viewCount: *, user, slug: *, downloadCount: ({default: number, type: (Number|NumberConstructor)}|*), updatedAt: *}}}
     */
    showEpisodeInfo(item) {
        if (item.episode) {
            /** import episodes transform */
            const EpisodesTransform = require("./episodesTransform");

            if (this.#episodeInfo) {
                return {episode: new EpisodesTransform().transform(item.episode)}
            }
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which answer comments is requested or not
     */
    withAnswers() {
        this.#answersInfo = true;
        return this;
    }

    /**
     * return answer comments info if it was requested
     * @param item
     * @return {{comments: (?[]|{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *})}}
     */
    showAnswersInfo(item) {
        if (this.#answersInfo) {
            return {comments: new CommentsTransform().withUserInfo().transformCollection(item.comments)}
        }
    }
}