/** import public routes */
const publicRouter = require('./public');
/** import admin routes */
const adminRouter = require('./admin');
/** import user routes */
const userRouter = require('./user');

/** import admin access manager middleware */
const {adminAccessManager: AAM} = require("../../middleware/adminAccessManager");
/** import user access manager middleware */
const {userAccessManager: UAM} = require("../../middleware/userAccessManager");

/** initialize routers main files */
exports.initializeWebRoutes = (app) => {
    app.use('/', publicRouter);
    app.use('/admin/panel', AAM, adminRouter);
    app.use('/user/panel', UAM, userRouter);
}