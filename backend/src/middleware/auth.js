const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const extractToken = (req) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

const requireAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Please log in to continue.'));
  try {
    req.user = { id: jwt.verify(token, config.jwtSecret).sub };
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Your session has expired. Please log in again.'));
  }
};

/** Attaches req.user when a valid token is present, otherwise continues anonymously. */
const optionalAuth = (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = { id: jwt.verify(token, config.jwtSecret).sub };
    } catch {
      /* treat as anonymous */
    }
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
