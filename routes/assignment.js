const express = require('express');
const assignmentController = require('../controllers/assignment.controller');

const router = express.Router();

router.post('/', assignmentController.createAssignment);
router.put('/:assignmentId', assignmentController.updateAssignment);
router.delete('/:assignmentId', assignmentController.deleteAssignment);
router.get('/', assignmentController.getAllAssignments);
router.get('/:assignmentId', assignmentController.getAssignment);

module.exports = router;