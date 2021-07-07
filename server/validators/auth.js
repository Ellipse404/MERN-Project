const { check, body } = require('express-validator');
const { isEqual } = require('lodash');

exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is Required'),
    check('email')
        .isEmail()
        .withMessage('Use a valid Email Address'),
    check('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters long')
];

exports.userSigninValidator = [

    check('email')
        .isEmail()
        .withMessage('Use a valid Email Address'),
    check('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters long')
];

exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 3 })
        .withMessage('Password must be at least  3 characters long')
];