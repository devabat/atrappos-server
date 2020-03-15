const Validator = require("validator");
const isEmpty = require("is-empty");


module.exports = function validateResetInput(data) {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";

    // Email checks
    if (Validator.isEmpty(data.email)) {
        errors.email = "Email field is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }
    // Password checks
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }
    // New Password checks
    if (Validator.isEmpty(data.newPassword)) {
        errors.newPassword = "The New Password field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

