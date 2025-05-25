const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/validators');
exports.createUser = async (userData) => {
  const { name, email, password, phone } = userData;
  let user = await User.findOne({ email });
  if (user) {
    throw new Error('User already exists');
  }
  user = new User({
    name,
    email,
    password,
    phone
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
};
exports.getAllUsers = async () => {
  const users = await User.find().select('-password');
  return users;
};
exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  return user;
};
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return false;
  }
  
  await user.remove();
  return true;
};
