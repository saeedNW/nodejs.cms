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

        console.log(PersianPaymentType)

        return {
            _id: item._id,
            hashId: item.hashId,
            title: item.title,
            slug: item.slug,
            PersianPaymentType,
            viewCount: item.viewCount,
            commentCount: item.commentCount,
            ...this.showFullInfo(item)
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