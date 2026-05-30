const { body } = require('express-validator');

const verifyOTPValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];
 
const signUpValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const signInValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const addExpenseValidation = [
  body('groupId')
    .notEmpty()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('splitMethod')
    .notEmpty()
    .withMessage('Split method is required')
    .isIn(['equal', 'amount', 'shares', 'percentage'])
    .withMessage('Invalid split method'),
  
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  
  body('participants.*.userId')
    .notEmpty()
    .withMessage('Participant user ID is required')
    .isMongoId()
    .withMessage('Invalid participant user ID')
];

module.exports = {
  signUpValidation,
  signInValidation,
  verifyOTPValidation,
  addExpenseValidation
};