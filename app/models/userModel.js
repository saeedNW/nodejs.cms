/** import mongoose */
const mongoose = require("mongoose");
/** import bcryptjs */
const bcrypt = require("bcryptjs");
/** import unique string module */
const uniqueString = require("unique-string");


/** define user collection schema */
const userSchema = new mongoose.Schema({
    hashId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rememberToken: {
        type: String,
        default: null
    }
}, {timestamps: true});

/** define collection indexes */
userSchema.index({hashId: 1});
userSchema.index({email: 1});
userSchema.index({admin: 1});

/** user schema pre save method */
userSchema.pre("save", function (next) {
    try {
        let user = this;

        /**
         * continue save/update process if user password didn't change.
         * return next if password was not modified.
         */
        if (!user.isModified("password")) return next();

        /**
         * continue save/update process if user password has benn changed.
         * change user password to new hashed value if password was modified.
         */
        user.password = bcrypt.hashSync(this.password, 15);
        next()
    } catch (err) {
        console.log(err)
    }
});

/**
 * user schema password comparer method
 * @param password
 * @return {boolean}
 */
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

/**
 * user schema set remember me token method
 * @param res
 */
userSchema.methods.setRememberToken = async function (res) {
    try {
        /** create remember me token */
        const token = uniqueString();

        /**
         * set remember token cookie.
         * set cookie max age for 30 days.
         * using signed option to secure cookie value in user browser.
         */
        res.cookie("remember_token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            signed: true
        });

        /** update user rememberToken in database */
        await this.updateOne({rememberToken: token});
    } catch (err) {
        console.log(err)
    }
}

module.exports = mongoose.model("User", userSchema);