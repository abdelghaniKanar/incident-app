const jwt = require('jsonwebtoken');
const config = require('../config/default');
exports.generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
};
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
exports.isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
};
exports.sanitizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    date: user.date
  };
};
