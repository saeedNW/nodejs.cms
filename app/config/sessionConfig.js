/** import connect-mongo module */
const MongoStore = require("connect-mongo");

let mongoUrl;
if (process.env.NODE_ENV === 'test') {
    mongoUrl = process.env.MONGODB_TEST_URL;
} else if (process.env.NODE_ENV === 'development') {
    mongoUrl = process.env.MONGODB_DEV_URL;
} else {
    mongoUrl = process.env.MONGODB_PROD_URL;
}

module.exports = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true
    },
    store: MongoStore.create({mongoUrl})
}