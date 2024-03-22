const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post('/sign-up', userController.signUp);
router.post('/login', userController.login)
router.post('/verify-otp', userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/password-change-otp', userController.verifyPasswordChangeOTP);
router.post('/password-change', userController.changePassword);

module.exports = router;