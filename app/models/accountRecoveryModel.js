/** import mongoose */
const mongoose = require("mongoose");
/** import json web token string module */
const jwt = require("jsonwebtoken");

/** define account recovery collection schema */
const accountRecoverySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    use: {
        type: Boolean,
        default: false
    }
}, {timestamps: {updatedAt: false}});

/** define collection indexes */
accountRecoverySchema.index({email: 1});
accountRecoverySchema.index({use: 1});

/** account recovery schema pre save method */
accountRecoverySchema.pre("validate", async function (next) {
    try {
        const accountRecovery = this;

        /**
         * continue save/update process if recovery token didn't change.
         * return next if recovery token  was not modified.
         */
        if (accountRecovery.token && !accountRecovery.isModified("token")) return next();

        /** create account recovery token */
        accountRecovery.token = await jwt.sign({email: this.email}, process.env.JWT_SECRET);

        next();
    } catch (err) {
        console.log(err)
    }
});

accountRecoverySchema.statics.decodeToken = function (token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}


module.exports = mongoose.model("AccountRecovery", accountRecoverySchema);