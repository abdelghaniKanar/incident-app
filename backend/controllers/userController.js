const { validationResult } = require('express-validator');
const userService = require('../services/userService');
exports.registerUser = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  try {
    const result = await userService.createUser({
      name,
      email,
      password,
      phone
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'User already exists') {
      return res.status(400).json({ msg: err.message });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (!result) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
};
