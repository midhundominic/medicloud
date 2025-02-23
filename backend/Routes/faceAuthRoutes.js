const express = require('express');
const router = express.Router();
const faceAuthController = require('../controllers/faceAuthController');
const authMiddleware = require('../middleware/auth');

// Register face (protected route)
router.post('/register', authMiddleware, faceAuthController.registerFace);

// Verify face (public route)
router.post('/verify', faceAuthController.verifyFace);

module.exports = router;