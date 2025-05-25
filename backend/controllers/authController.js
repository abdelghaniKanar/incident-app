const { validationResult } = require('express-validator');
const authService = require('../services/authService');
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await authService.authenticateUser(email, password);
    return res.json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Invalid Credentials') {
      return res.status(401).json({ msg: err.message });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.getAuthUser = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    await authService.changePassword(userId, currentPassword, newPassword);
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Current password is incorrect') {
      return res.status(400).json({ msg: err.message });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
