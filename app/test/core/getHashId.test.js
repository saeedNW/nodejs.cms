/** import chi module should method */
const should = require("chai").should();
/** import database connection manager */
const {DBConnection, DBClose} = require('../../config/db');
/** import unique identifier core */
const {identifierInitializer} = require("../../core/initIdentifierCollection");
/** import courses model */
const {courseModel, identifierModel} = require("../../models").model


describe("identifier model test", () => {
    before("open database connection", done => {
        DBConnection()
            .then(async () => {
                done()
            })
            .catch((err) => done(err));
    });

    after("close database connection", (done) => {
        DBClose()
            .then(() => done())
            .catch((err) => done(err));
    });

    it('identifier model max hash id (20000) should retrieves (20001)', async () => {
        /** create new course with hash id of 20,000 */
        await courseModel.create({
            hashId: 20000,
            user: "62725ed309b72d17ee85b3fc",
            title: "test",
            slug: "test",
            paymentType: "free",
            description: "this is a description text for new course to test hashId generator",
            images: "this is a test image",
            price: 25000,
            tags: 'test, node, sql'
        });

        /** initialize identifier collection */
        await identifierInitializer();

        /** get last identifier for a random collection */
        const offersCounter = await identifierModel.findOne({
            model: 'courses'
        });

        offersCounter.count.toString().should.be.eql("20001");
    });
});