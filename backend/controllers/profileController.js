const { validationResult } = require('express-validator');
const profileService = require('../services/profileService');
exports.getCurrentProfile = async (req, res) => {
  try {
    const user = await profileService.getUserProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone } = req.body;
  const userId = req.user.id;

  try {
    const user = await profileService.updateUserProfile(userId, { name, email, phone });
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Email already in use') {
      return res.status(400).json({ msg: err.message });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.updatePhone = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone } = req.body;
  const userId = req.user.id;

  try {
    const user = await profileService.updatePhone(userId, phone);
    return res.json({ msg: 'Phone number updated successfully', user });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.updateEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const userId = req.user.id;

  try {
    const user = await profileService.updateEmail(userId, email);
    return res.json({ msg: 'Email updated successfully', user });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Email already in use') {
      return res.status(400).json({ msg: err.message });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
