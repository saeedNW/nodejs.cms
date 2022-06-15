/** import mongoose */
const mongoose = require("mongoose");
/** extract schema method from mongoose module */
const {Schema} = mongoose
/** import bcryptjs */
const bcrypt = require("bcryptjs");
/** import unique string module */
const uniqueString = require("unique-string");
/** import mongoose paginate module */
const mongoosePaginate = require('mongoose-paginate-v2');
/** import permissions constant */
const {permissionsConstants} = require("../constants");

/** define user collection schema */
const userSchema = new Schema({
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
    },
    purchases: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: null
    },
}, {timestamps: true, toJSON: {virtuals: true}});

/** define collection indexes */
userSchema.index({hashId: 1});
userSchema.index({email: 1});
userSchema.index({admin: 1});

/** initialize mongoose paginate plugin for user schema */
userSchema.plugin(mongoosePaginate);

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
         * continue save/update process if user password has been changed.
         * change user password to new hashed value if password was modified.
         */
        user.password = bcrypt.hashSync(this.password, 15);
        next()
    } catch (err) {
        next(err)
    }
});

/** user schema pre update method */
userSchema.pre("findOneAndUpdate", function (next) {
    try {
        /**
         * continue update process if user password didn't change.
         * return next if password was not modified.
         */
        const modifiedPassword = this.getUpdate().$set.password;
        if (modifiedPassword.length === 0) {
            delete this.getUpdate().$set.password
            return next();
        }

        /**
         * continue update process if user password has been changed.
         * change user password to new hashed value if password was modified.
         */
        this.getUpdate().$set.password = bcrypt.hashSync(this.getUpdate().$set.password, 15);
        next();
    } catch (err) {
        next(err)
    }
})

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
 * @param next
 */
userSchema.methods.setRememberToken = async function (res, next) {
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
        next(err)
    }
}

/**
 * create a virtual field to be used for
 * user and course collections relation
 * through populate method.
 */
userSchema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "user",
});

/**
 * create a virtual field to be used for
 * user and payments collections relation
 * through populate method.
 */
userSchema.virtual("payments", {
    ref: "Payment",
    localField: "_id",
    foreignField: "user",
});

/**
 * create a virtual field to be used for
 * user and comments collections relation
 * through populate method.
 */
userSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "user",
});

/**
 * check if user is a vip user or not
 * @return {boolean}
 */
userSchema.methods.isVip = async function () {
    if (await hasPermission(this))
        return true;

    return false;
}

/**
 * check if user already bought the chosen course or not
 * @param courseId
 * @return {boolean}
 */
userSchema.methods.haveBought = async function (courseId) {
    if (await hasPermission(this))
        return true;

    return this.purchases.indexOf(courseId) !== -1;
}

async function hasPermission(userInfo) {
    /**
     * get user info from request.
     * populate with user roles
     */
    const user = await userInfo.populate({
        path: "role",
        /**
         * populate roles with role permissions
         */
        populate: {
            path: "permissions"
        }
    });

    /**
     * get user access permissions title as an array
     * @type {*[]}
     */
    const userPermissions = user.role.permissions.map(permission => permission.title);

    return userPermissions.includes(permissionsConstants.AccessPermissions.fullAccess);
}

module.exports = mongoose.model("User", userSchema);