/** import main transform file */
const Transform = require("./transform");
/** import courses constants */
const {coursesConstants} = require("../constants");

/**
 * courses data transformer
 */
module.exports = class CoursesTransform extends Transform {
    /**
     * this private variable will be used to determined
     * which full info of the course is requested or not
     * @type {boolean}
     */
    #fullInfoStatus = false;
    /**
     * this private variable will be used to determined
     * which basic info of the episodes is requested or not
     * @type {boolean}
     */
    #episodeBasicInfo = false;
    /**
     * this private variable will be used to determined
     * which full info of the episodes is requested or not
     * @type {boolean}
     */
    #episodeFullInfo = false;
    /**
     * this private variable will be used to determined
     * which info of the user is requested or not
     * @type {boolean}
     */
    #userInfo = false;

    /**
     * transforming the course data
     * @param item
     */
    transform(item) {
        /** define payment type */
        let PersianPaymentType;

        /** set payment type value */
        switch (item.paymentType) {
            case coursesConstants.PaymentType.cash:
                PersianPaymentType = coursesConstants.PersianPaymentType.cash;
                break;
            case coursesConstants.PaymentType.vip:
                PersianPaymentType = coursesConstants.PersianPaymentType.vip;
                break;
            default:
                PersianPaymentType = coursesConstants.PersianPaymentType.free;
        }

        return {
            _id: item._id,
            hashId: item.hashId,
            title: item.title,
            slug: item.slug,
            PersianPaymentType,
            viewCount: item.viewCount,
            commentCount: item.commentCount,
            ...this.showFullInfo(item),
            ...this.showEpisodeBasicInfo(item),
            ...this.showEpisodeFullInfo(item),
            ...this.showUserInfo(item),
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which course full info is requested or not
     */
    withFullInfo() {
        this.#fullInfoStatus = true;
        return this;
    }

    /**
     * return course full info if it was requested
     * @param item
     * @return {{createdAt: *, images: (string|HTMLCollectionOf<HTMLImageElement>|*), price: (number|*), description, time, user, tags, updatedAt: *}}
     */
    showFullInfo(item) {
        if (this.#fullInfoStatus) {
            return {
                user: item.user,
                description: item.description,
                images: item.images,
                thumbnail: item.thumbnail,
                paymentType: item.paymentType,
                price: item.price,
                tags: item.tags,
                time: item.time,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which episode basic info is requested or not
     */
    withEpisodeBasicInfo() {
        this.#episodeBasicInfo = true;
        return this;
    }

    /**
     * return episode basic info if it was requested
     * @param item
     * @return {{episodes: (*[]|{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *})}}
     */
    showEpisodeBasicInfo(item) {
        /** import episodes transform */
        const EpisodesTransform = require("./episodesTransform");

        if (this.#episodeBasicInfo) {
            return {episodes: new EpisodesTransform().transformCollection(item.episodes)}
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which episode full info is requested or not
     */
    withEpisodeFullInfo() {
        this.#episodeFullInfo = true;
        return this;
    }

    /**
     * return episode full info if it was requested
     * @param item
     * @return {{images: (string|HTMLCollectionOf<HTMLImageElement>|*), description, title: *, PersianPaymentType: *, hashId: *, commentCount: *, tags, createdAt: *, price: (number|*), _id: *, viewCount: *, time, user, slug: *, updatedAt: *}}
     */
    showEpisodeFullInfo(item) {
        /** import episodes transform */
        const EpisodesTransform = require("./episodesTransform");

        if (this.#episodeFullInfo) {
            return {episodes: new EpisodesTransform().withFullInfo().transformCollection(item.episodes)}
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
}