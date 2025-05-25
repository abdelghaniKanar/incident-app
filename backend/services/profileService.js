const User = require('../models/User');
exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  return user;
};
exports.updateUserProfile = async (userId, profileData) => {
  const { name, email, phone } = profileData;
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use');
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { name, email, phone } },
    { new: true }
  ).select('-password');

  return updatedUser;
};
exports.updatePhone = async (userId, phone) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { phone } },
    { new: true }
  ).select('-password');

  return updatedUser;
};
exports.updateEmail = async (userId, email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.id !== userId) {
    throw new Error('Email already in use');
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { email } },
    { new: true }
  ).select('-password');

  return updatedUser;
};
