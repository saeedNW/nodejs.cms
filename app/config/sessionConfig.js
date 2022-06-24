/** import main config file */
const Config = require("./config");
/** import connect-mongo module */
const MongoStore = require("connect-mongo");

/**
 * session configs
 */
class SessionConfig extends Config {
    /**
     * specify mongodb connection url
     * based on nodes' running environment
     * @return {*}
     */
    #mongoUrl = () => {
        if (process.env.NODE_ENV === 'test') {
            return process.env.MONGODB_TEST_URL;
        } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'debugging') {
            return process.env.MONGODB_DEV_URL;
        } else if (process.env.NODE_ENV === 'production') {
            return process.env.MONGODB_PROD_URL;
        }
    }


    /**
     * return session configurations
     * @return {{cookie: {httpOnly: boolean}, saveUninitialized: boolean, secret: *, store: MongoStore, resave: boolean}}
     */
    sessionConfig() {
        return {
            name: process.env.SESSION_NAME,
            secret: process.env.SESSION_SECRET,
            resave: true,
            saveUninitialized: true,
            cookie: {
                httpOnly: true
            },
            store: MongoStore.create({mongoUrl: this.#mongoUrl()})
        }
    }
}

module.exports = new SessionConfig();