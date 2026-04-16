const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const hospitalAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hospital_admin') return next();
  return res.status(403).json({ success: false, message: 'Hospital admin access only' });
};

const ambulanceOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ambulance') return next();
  return res.status(403).json({ success: false, message: 'Ambulance driver access only' });
};

module.exports = { protect, hospitalAdminOnly, ambulanceOnly };
