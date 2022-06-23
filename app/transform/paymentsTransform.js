/** import main transform file */
const Transform = require("./transform");

/**
 * episodes data transformer
 */
module.exports = class PaymentsTransform extends Transform {
    /**
     * this private variable will be used to determined
     * which info of the user is requested or not
     * @type {boolean}
     */
    #userInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the course is requested or not
     * @type {boolean}
     */
    #courseInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the vip plan is requested or not
     * @type {boolean}
     */
    #vipPlanInfo = false;

    /**
     * transforming payments data
     * @param item
     */
    transform(item) {
        return {
            _id: item._id,
            hashId: item.hashId,
            price: item.price,
            paymentStatus: item.paymentStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            ...this.showUserInfo(item),
            ...this.showCourseInfo(item),
            ...this.showVipPlanInfo(item),
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
        const UserTransform = require("./usersTransform");

        if (this.#userInfo) {
            return {user: new UserTransform().withHashedEmail().transform(item.user)}
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
     * determined which vip plan info is requested or not
     */
    withVipPlanInfo() {
        this.#vipPlanInfo = true;
        return this;
    }

    /**
     * return course info if it was requested
     * @param item
     * @return {{images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, commentCount: *, tags, createdAt: *, price: (number|*), _id: *, viewCount: *, time, user, slug: *, updatedAt: *}}
     */
    showVipPlanInfo(item) {
        if (item.vip) {
            if (this.#vipPlanInfo)
                return {vip: item.vip}
        }
    }
}