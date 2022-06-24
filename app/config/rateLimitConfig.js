/** import main config file */
const Config = require("./config");
/** import express rate limit */
const rateLimit = require('express-rate-limit');

/**
 * rate limiter configs
 */
class RateLimitConfig extends Config {
    /**
     * initialize rate limit handler
     */
    rateLimitHandler() {
        return rateLimit({...this.rateLimitConfig()});
    }

    /**
     * return session configurations
     * @return {{handler: (function(*, *, *, *): *), windowMs: number, legacyHeaders: boolean, max: number, standardHeaders: boolean}}
     */
    rateLimitConfig() {
        return {
            windowMs: 60 * 1000, // 1 minutes
            max: 50, // Limit each IP to 100 requests per `window` (here, per 50 minutes)
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            handler: this.errorHandler
        }
    }

    /**
     * rate limiter error handler
     * @param request
     * @param response
     * @param next
     * @param options
     */
    errorHandler(request, response, next, options) {
        response.status(options.statusCode).json({
            error: {
                message: options.message,
                status: options.statusCode,
                method: request.method,
                path: request.baseUrl
            }
        })
    }
}

module.exports = new RateLimitConfig();