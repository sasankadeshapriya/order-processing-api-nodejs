const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.post('/sign-up', adminController.signUp);
router.post('/login', adminController.login)
router.post('/verify-otp', adminController.verifyOTP);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/password-change-otp', adminController.verifyPasswordChangeOTP);
router.post('/password-change', adminController.changePassword);
router.put('/admin/password-change', adminController.adminPasswordChange);
router.delete('/admin/delete-account', adminController.deleteAccount);

module.exports = router;