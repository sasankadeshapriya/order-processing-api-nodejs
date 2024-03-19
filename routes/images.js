const express = require('express');
const imageController = require('../controllers/image.controller');
const imageUploader = require('../utils/image-uploader');
const authCheckMiddleware = require('../middleware/authentication');

const router = express.Router();

router.post('/upload', authCheckMiddleware.authCheck , imageUploader.upload.single('image'), imageController.upload);

module.exports = router;