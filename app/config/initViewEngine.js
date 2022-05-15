/** import express-ejs-layouts module */
const expressLayouts = require("express-ejs-layouts");
/** import path module */
const path = require('path');

/**
 * view engine and ejs middleware initializer
 * @param app
 * @param express
 */
exports.initViewEngine = (app, express) => {
    /** initialize static files */
    app.use(express.static('public'));

    /** initialize express-ejs-layouts */
    app.use(expressLayouts);

    /** initialize View Engine */
    app.set("view engine", "ejs");

    /**
     * define main layout file location
     * Note.1: default layout file should be in view files directory,
     * so if you plan to put them in a subdirectory like "views/layouts",
     * you should change default layout setting using "layout" middleware.
     * Note.2: for changing layout default setting the path should be started from
     * view files directory which in this case it should be "./layouts/mainLayout".
     * Note.3: you can also define and change layout for specific pages during page
     * render process with "layout" option.
     * Note.4: you can also define and change default layout for a specific router
     * with router middleware which means all the router and pages that are going
     * to use that router will be rendered with the chosen layout instead of default
     * layout, you can see the changer function at the bottom of this file and
     * example of it usage in "app/router/web/admin/index.js"
     */
    app.set("layout", "./layouts/mainLayout");

    /**
     * enable express-ejs-layouts extractScripts feature.
     * this feature will extract all html "script" tags and put them at the defined location in the layout.
     */
    app.set("layout extractScripts", true);

    /**
     * enable express-ejs-layouts extractStyles feature.
     * this feature will extract all html "style" tags and put them at the defined location in the layout.
     */
    app.set("layout extractStyles", true);

    /** set view files location */
    app.set("views", path.resolve("./resource/views"));
}

/**
 * change view engin default render layout for a specific router
 * @param router router that you want to change the default layout for it
 * @param layoutLocation new layout file location address
 */
exports.changeDefaultLayout = (router, layoutLocation) => {
    router.use((req, res, next) => {
        res.locals.layout = layoutLocation;
        next();
    })
}