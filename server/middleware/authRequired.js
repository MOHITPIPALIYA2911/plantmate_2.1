// server/src/middleware/authRequired.js
const jwt = require('jsonwebtoken');
module.exports = function authRequired(req, res, next) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    req.headers["x-auth-token"] ||
    req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
