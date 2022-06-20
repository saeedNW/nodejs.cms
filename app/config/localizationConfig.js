/** import main config file */
const Config = require("./config");
/** import path module */
const path = require("path");
/** import fs module */
const fs = require("fs");

/**
 * session configs
 */
class LocalizationConfig extends Config {
    /**
     * localization init config
     * @return {{detection: {lookupCookie: string}, backend: {loadPath: string}, preload: string[], fallbackLng: string}}
     */
    localizationConfigs() {
        return {
            preload: ['fa', 'en'],
            fallbackLng: "fa",
            backend: {
                loadPath: path.resolve("./resource/languages/{{lng}}.json")
            },
            detection: {
                lookupCookie: 'language'
            }
        }
    }

    /**
     * set user localization cookie
     * @param req
     * @param res
     */
    changeLanguage(req, res) {
        /** extract language from request params */
        const {language} = req.params;

        /**
         * set language cookie.
         * set cookie max age for 90 days.
         * using signed option to secure cookie value in user browser.
         */
        if (fs.existsSync(path.resolve(`./resource/languages/${language}.json`)))
            res.cookie("language", language, {
                maxAge: 1000 * 60 * 60 * 24 * 90,
                httpOnly: true,
            });

        res.redirect(req.header("Referer") || "/");
    }

    /**
     * set default language
     * @param req
     */
    setDefaultLanguage(req){
        /** get user language signed cookie */
        const language = req.cookies.language;

        /**
         * set default language to "fa" if
         * user didn't specify any language
         */
        if (!language)
            req.cookies.language = "fa";
    }
}

module.exports = new LocalizationConfig();