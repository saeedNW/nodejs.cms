module.exports = {
    /**
     * checking user password strength
     * password should be at least 8 characters
     * password should contain at least a capital letter
     * password should contain at least a small letter,
     * password should contain at least a number
     * password should contain at least 2 special characters
     */
    PasswordRegEx: new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$&*].*[!@#$&*])(?=.{8,})")
};