const express = require('express');
const router = express.Router();
const { getUsers, getUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.route('/')
  .get(protect, roleGuard('admin'), getUsers);

router.route('/:id')
  .get(protect, roleGuard('admin'), getUser);

module.exports = router;
