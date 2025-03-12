const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const biometricController = require("../controllers/biometricController")
//Auth Middlware removed from biometric

router.post('/register',biometricController.generateRegistrationOptions);
router.post('/verify-registration',biometricController.verifyRegistration);
router.post('/authenticate-biometric',biometricController.generateAuthenticationOptions);
router.post('/verify-authentication',biometricController.verifyAuthentication);

module.exports = router;
