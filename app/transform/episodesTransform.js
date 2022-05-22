/** import main transform file */
const Transform = require("./transform");
/** import episodes constants */
const {episodesConstants} = require("../constants");

/**
 * episodes data transformer
 */
module.exports = class EpisodesTransform extends Transform {
    /**
     * this private variable will be used to determined
     * which full info of the episode is requested or not
     * @type {boolean}
     */
    #fullInfoStatus = false;
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
     * transforming the course data
     * @param item
     */
    transform(item) {
        /** define payment type */
        let PersianPaymentType;

        /** set payment type value */
        switch (item.paymentType) {
            case episodesConstants.PaymentType.cash:
                PersianPaymentType = episodesConstants.PersianPaymentType.cash;
                break;
            case episodesConstants.PaymentType.vip:
                PersianPaymentType = episodesConstants.PersianPaymentType.vip;
                break;
            default:
                PersianPaymentType = episodesConstants.PersianPaymentType.free;
        }

        return {
            _id: item._id,
            hashId: item.hashId,
            episodeNumber: item.episodeNumber,
            title: item.title,
            episodeUrl: item.episodeUrl,
            time: item.time,
            PersianPaymentType,
            viewCount: item.viewCount,
            commentCount: item.commentCount,
            ...this.showCourseBasicInfo(item),
            ...this.showCourseFullInfo(item),
            ...this.showFullInfo(item)
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which episode full info is requested or not
     */
    withFullInfo() {
        this.#fullInfoStatus = true;
        return this;
    }

    /**
     * return episode full info if it was requested
     * @param item
     * @return {{createdAt: *, description, time, episodeNumber: ({type: Number | NumberConstructor, required: boolean}|*), downloadCount: ({default: number, type: Number | NumberConstructor}|*), updatedAt: *, paymentType: (number|*)}}
     */
    showFullInfo(item) {
        if (this.#fullInfoStatus) {
            return {
                description: item.description,
                downloadCount: item.downloadCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                paymentType: item.paymentType,
            }
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which course basic info is requested or not
     */
    withCourseBasicInfo() {
        this.#courseBasicInfo = true;
        return this;
    }

    /**
     * return course basic info if it was requested
     * @param item
     * @return {{images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, commentCount: *, tags, createdAt: *, price: (number|*), _id: *, viewCount: *, time, user, slug: *, updatedAt: *}}
     */
    showCourseBasicInfo(item) {
        /** import courses transform */
        const CoursesTransform = require("./coursesTransform");

        if (this.#courseBasicInfo) {
            return {course: new CoursesTransform().transform(item.course)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which course full info is requested or not
     */
    withCourseFullInfo() {
        this.#courseFullInfo = true;
        return this;
    }

    /**
     * return course full info if it was requested
     * @param item
     * @return {{images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, commentCount: *, tags, createdAt: *, price: (number|*), _id: *, viewCount: *, time, user, slug: *, updatedAt: *}}
     */
    showCourseFullInfo(item) {
        /** import courses transform */
        const CoursesTransform = require("./coursesTransform");

        if (this.#courseFullInfo) {
            return {course: new CoursesTransform().withFullInfo().transform(item.course)}
        }
    }
}