const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth');
const logger = require('../../middleware/logger');
router.use(logger);
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);
router.get('/', auth, authController.getAuthUser);

router.post(
  '/change-password',
  [
    auth,
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.changePassword
);

module.exports = router;
