/**
 * this function will be used to create
 * access slugs based on given string
 * @param string
 * @return {*}
 */
exports.createSlug = (string) => {
    return string.replace(/([^۰-۹آ-یa-zA-Z0-9]|-)+/g, "-");
}