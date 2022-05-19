/** import autoBind module */
const autoBind = require("auto-bind");

/**
 * main transform class
 */
module.exports = class Transform {
    /**
     * this private variable will be used to determined
     * which pagination is requested or not
     * @type {boolean}
     */
    #paginateStatus = false

    constructor() {
        autoBind(this);
    }

    /**
     * transforming data for multiply data.
     * (transforming data in an array of objects reads from database)
     * @param items
     * @param CollectionName
     * @return {unknown[]|{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *}}
     */
    transformCollection(items, CollectionName = "docs") {
        /** return data without pagination info */
        if (!this.#paginateStatus)
            return items.docs.map(this.transform);

        /** return data with pagination info */
        return {
            [CollectionName]: items.docs.map(this.transform),
            ...this.paginateItem(items)
        }
    }

    /**
     * this method will be called from outside the transform file to
     * determined which pagination is requested or not
     */
    withPaginate() {
        this.#paginateStatus = true;
        return this;
    }

    /**
     * return pagination info if it was requested
     * @param items
     * @return {{hasPrevPage: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit, totalPages: *, prevPage: *, page: *, totalDocs: *}}
     */
    paginateItem(items) {
        return {
            totalDocs: items.totalDocs,
            limit: items.limit,
            totalPages: items.totalPages,
            page: items.page,
            pagingCounter: items.pagingCounter,
            hasPrevPage: items.hasPrevPage,
            hasNextPage: items.hasNextPage,
            prevPage: items.prevPage,
            nextPage: items.nextPage
        }
    }

}