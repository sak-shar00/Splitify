const express = require('express');
const { signUp, signIn, getProfile, verifyOTP, resendOTP, updateSettings } = require('../controllers/authController');
const { signUpValidation, signInValidation, verifyOTPValidation } = require('../middlewares/validation');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/sign-up', signUpValidation, async (req, res) => {
  signUp(req, res);
});

router.post('/sign-in', signInValidation, async (req, res) => {
  signIn(req, res);
});

router.post('/verify-otp', verifyOTPValidation, async (req, res) => {
  verifyOTP(req, res);
});

router.post('/resend-otp', async (req, res) => {
  resendOTP(req, res);
});

router.get('/profile', authMiddleware, async (req, res) => {
  getProfile(req, res);
});

router.put('/settings', authMiddleware, async (req, res) => {
  updateSettings(req, res);
});

module.exports = router;