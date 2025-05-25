const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../../controllers/userController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const logger = require('../../middleware/logger');
router.use(logger);

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  userController.registerUser
);
router.get('/', auth, role(['admin']), userController.getAllUsers);

router.get('/:id', auth, role(['admin']), userController.getUserById);

router.delete('/:id', auth, role(['admin']), userController.deleteUser);

module.exports = router;
