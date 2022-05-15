const Transform = require("./transform");
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
     * transforming the course data
     * @param item
     * @return {{images: *, description: *, title, hashId: (number|*), paymentType: string, commentCount: ({default: number, type: Number | NumberConstructor}|*), tags: *, createdAt: *, price: *, _id, viewCount: ({default: number, type: Number | NumberConstructor}|*), time: *, user: *, slug: (string|((str: string) => string)|string|*), updatedAt: *}}
     */
    transform(item) {
        /** define payment type */
        let paymentType;
        
        /** set payment type value */
        switch (item.paymentType) {
            case coursesConstants.PaymentType.cash:
                paymentType = coursesConstants.PersianPaymentType.cash;
                break;
            case coursesConstants.PaymentType.vip:
                paymentType = coursesConstants.PersianPaymentType.vip;
                break;
            default:
                paymentType = coursesConstants.PersianPaymentType.free;
        }

        return {
            _id: item._id,
            hashId: item.hashId,
            title: item.title,
            slug: item.slug,
            paymentType,
            viewCount: item.viewCount,
            commentCount: item.commentCount,
            ...this.showFullInfo(item)
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which course full info is requested or not
     * @return {Transform}
     */
    fullInfo() {
        this.#fullInfoStatus = true;
        return this;
    }

    /**
     * return course full info if it was requested
     * @param item
     * @return {{createdAt: *, images: (string|HTMLCollectionOf<HTMLImageElement>|*), price: (number|*), description, time, user, tags, updatedAt: *}}
     */
    showFullInfo(item) {
        return {
            user: item.user,
            description: item.description,
            images: item.images,
            price: item.price,
            tags: item.tags,
            time: item.time,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }
    }
}