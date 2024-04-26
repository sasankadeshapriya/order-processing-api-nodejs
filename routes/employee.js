const express = require('express');
const employeeController = require('../controllers/employee.controllers');
const checkAuthMiddleware = require('../middleware/authentication');

const router = express.Router();

router.post('/sign-up', employeeController.signUp);
router.post('/login', employeeController.login)
router.post('/verify-otp', employeeController.verifyOTP);
router.post('/forgot-password', employeeController.forgotPassword);
router.post('/password-change-otp', employeeController.verifyPasswordChangeOTP);
router.post('/password-change', employeeController.changePassword);
router.get('/all', employeeController.getAllEmployees);
router.get('/:employeeId/details', employeeController.getEmployeeDetails);
router.post('/create', employeeController.createEmployee);
router.put('/:employeeId/update/location', employeeController.updateEmployeeLocation);

//test
const testController = require('../controllers/test.controller');
router.get('/:employeeId/admin-details', checkAuthMiddleware.adminAuthCheck,  testController.getEmployeeAdminDetails);

module.exports = router;