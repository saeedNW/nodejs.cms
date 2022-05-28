/** import mongoose module */
const mongoose = require('mongoose');
/** import main config file */
const Config = require("./config");

/**
 * database configs
 */
class DatabaseConfig extends Config {7
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
     * database connection method.
     * @return {Promise<unknown>}
     */
    async DBConnection() {
        return new Promise((resolve, reject) => {
            mongoose.connect(this.#mongoUrl()).then(
                (conn) => {
                    resolve(conn);
                }
            ).catch((err) => {
                reject(err);
            });
        })
    }

    /**
     * database close connection method.
     * this method will be used in test environment
     * @return {Promise<void>}
     */
    async DBClose() {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
}

module.exports = new DatabaseConfig();