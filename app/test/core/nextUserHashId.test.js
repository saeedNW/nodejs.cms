/** import chi module should method */
const should = require("chai").should();
/** import database connection manager */
const {DBConnection, DBClose} = require('../../config/db');
/** import unique identifier core */
const {identifierInitializer} = require("../../core/initIdentifierCollection");
/** import user hash id generator */
const {nextUserHashId} = require("../../core/nextUserHashId");


describe("user hashId (identifier) generator test", () => {
    before("open database connection", done => {
        DBConnection()
            .then(async () => {
                await identifierInitializer()
                done()
            })
            .catch((err) => done(err));
    });

    after("close database connection", (done) => {
        DBClose()
            .then(() => done())
            .catch((err) => done(err));
    });

    it("nextUserHashId function (user hashId generator function) returns 1000 unique ids", async () => {
        try {
            /**
             * total tests count
             * @type {number}
             */
            const totalTestsCount = 1000;

            /**
             * setup ids saver collection
             * @type {Set<any>}
             */
            const ids = new Set();

            for (let i = 0; i < totalTestsCount; i++) {
                /** generate users hash ids */
                const hashId = await nextUserHashId();
                /** check new generated hashId existence */
                ids.has(hashId).should.be.false;
                /** add new generated hashId to ids collection */
                ids.add(hashId);
            }
        } catch (err) {
            console.log(err);
        }
    });
});
