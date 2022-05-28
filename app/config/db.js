/** import mongoose module */
const mongoose = require('mongoose');

/** connect to mongodb using mongoose */
exports.DBConnection = async () => {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'test') {
            mongoose.connect(process.env.MONGODB_TEST_URL).then(
                (conn) => {
                    resolve(conn);
                }
            ).catch((err) => {
                reject(err);
            });
        } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'debugging') {
            mongoose.connect(process.env.MONGODB_DEV_URL).then(
                (conn) => {
                    resolve(conn);
                }
            ).catch((err) => {
                reject(err);
            });
        } else {
            mongoose.connect(process.env.MONGODB_PROD_URL).then(
                (conn) => {
                    resolve(conn);
                }
            ).catch((err) => {
                reject(err);
            });
        }

    })
}


exports.DBClose = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
}