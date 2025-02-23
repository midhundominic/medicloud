const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "midhun12345";

const authMiddleware = (req, res, next) => {
  // Allow biometric authentication endpoint without token
  if (req.originalUrl.includes('/api/biometric/authenticate-biometric') || 
      req.originalUrl.includes('/api/biometric/verify-authentication')) {
    return next();
  }

  try {
    // Check for token in different places
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer Token
      req.cookies?.token ||                       // Cookie
      req.headers['x-access-token'];             // Custom header

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided.",
        isSessionExpired: true
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token expired
    if(decoded.exp < Date.now() / 1000){
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        isSessionExpired: true
      });
    }

    // Add user info to request
    req.user = decoded;

    // Temporarily disable session check for specific routes
    if (req.originalUrl.includes('/upload-result') || 
        req.originalUrl.includes('/api/biometric/register') ||
        req.originalUrl.includes('/api/biometric/verify-registration')) {
      return next();
    }

    // Session check for other routes
    if(!req.session?.userId || req.session.userId != decoded.userId){
      return res.status(401).json({
        success: false,
        message: 'Invalid session',
        isSessionExpired: true
      });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(403).json({
      success: false,
      message: error.message === 'jwt expired'
        ? 'Token has expired' 
        : 'Invalid token',
      isSessionExpired: true
    });
  }
};

module.exports = authMiddleware;