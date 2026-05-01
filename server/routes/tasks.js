const express = require('express');
const router = express.Router();
const { 
  getTasks, getTask, createTask, 
  updateTask, deleteTask, getDashboardStats 
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// Dashboard stats must come before /:id route
router.get('/stats/dashboard', protect, getDashboardStats);

router.route('/')
  .get(protect, getTasks)
  .post(protect, roleGuard('admin'), createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)  // Both admin and member can update (controller handles permissions)
  .delete(protect, roleGuard('admin'), deleteTask);

module.exports = router;
