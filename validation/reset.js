const Validator = require("validator");
const isEmpty = require("is-empty");


module.exports = function validateResetInput(data) {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";
    data.repeatNewPassword = !isEmpty(data.repeatNewPassword) ? data.repeatNewPassword : "";

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

    //  Repeat New Password checks
    if (Validator.isEmpty(data.repeatNewPassword)) {
        errors.repeatNewPassword = "The Repeat New Password field is required";
    }

    // New Password checks
    if (data.repeatNewPassword !== data.newPassword) {
        errors.notMatch = "Passwords do not match";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

