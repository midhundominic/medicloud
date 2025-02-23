const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const biometricController = require("../controllers/biometricController")


router.post('/register', authMiddleware,biometricController.generateRegistrationOptions);
router.post('/verify-registration', authMiddleware,biometricController.verifyRegistration);
router.post('/authenticate-biometric',biometricController.generateAuthenticationOptions);
router.post('/verify-authentication',biometricController.verifyAuthentication);

module.exports = router;
