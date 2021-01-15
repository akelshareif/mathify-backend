const jwt = require('jsonwebtoken');
const ExpressError = require('../helpers/expressError');

const authenticateJWT = (req, res, next) => {
    try {
        const tokenStr = req.body._token || req.query._token;
        const payload = jwt.verify(tokenStr, process.env.SESSION_SECRET);
        req.user = payload.username;
        return next();
    } catch (e) {
        return next();
    }
};

const ensureAuth = (req, res, next) => {
    if (!req.user) {
        const err = new ExpressError('Unauthorized: You must be authenticated to view this page', 401);
        return next(err);
    }

    return next();
};

module.exports = {
    authenticateJWT,
    ensureAuth,
};
