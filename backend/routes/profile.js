const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const profileController = require('../../controllers/profileController');
const auth = require('../../middleware/auth');
const logger = require('../../middleware/logger');


router.use(logger);
router.get('/me', auth, profileController.getCurrentProfile);
router.put(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  profileController.updateProfile
);
router.put(
  '/phone',
  [
    auth,
    [
      check('phone', 'Please provide a valid phone number').not().isEmpty()
    ]
  ],
  profileController.updatePhone
);
router.put(
  '/email',
  [
    auth,
    [
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  profileController.updateEmail
);

module.exports = router;
