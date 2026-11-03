const authService = require('../services/authService');

exports.attachUser = (req, res, next) => {
  req.user = authService.getUserFromRequest(req);
  next();
};

exports.requireRole = role => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
  }
  next();
};
