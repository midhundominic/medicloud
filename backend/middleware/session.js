const session = require('express-session')

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'midhun12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
});

module.exports = sessionMiddleware;