const session = require('express-session')

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'midhun12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? 'medicloud-c2l8.onrender.com' : 'localhost'
    }
});

module.exports = sessionMiddleware;