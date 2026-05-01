const express = require('express');
const router = express.Router();
const { 
  getProjects, getProject, createProject, 
  updateProject, deleteProject, addMember, removeMember 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.route('/')
  .get(protect, getProjects)
  .post(protect, roleGuard('admin'), createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, roleGuard('admin'), updateProject)
  .delete(protect, roleGuard('admin'), deleteProject);

router.route('/:id/members')
  .post(protect, roleGuard('admin'), addMember);

router.route('/:id/members/:userId')
  .delete(protect, roleGuard('admin'), removeMember);

module.exports = router;
