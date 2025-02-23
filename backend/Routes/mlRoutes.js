const express = require('express');
const router = express.Router();
const multer = require('multer');
const mlController = require('../controllers/mlController');
const authMiddleware = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.post(
    '/analyze-prescription',
    authMiddleware,
    upload.single('prescription'),
    mlController.analyzePrescription
);

router.post('/predict-disease', mlController.predictDisease);

module.exports = router;
