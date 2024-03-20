const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post('/sign-up', userController.signUp);
router.post('/login', userController.login)
router.post('/verify-otp', userController.verifyOTP);

module.exports = router;