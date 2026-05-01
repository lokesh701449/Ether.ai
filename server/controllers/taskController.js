const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks (filterable by project, status, assignee)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo, priority } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    // Members can only see tasks in their projects
    if (req.user.role === 'member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map(p => p._id);
      filter.project = filter.project 
        ? (projectIds.some(id => id.equals(filter.project)) ? filter.project : null)
        : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, status } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If assigning to someone, verify they're a project member
    if (assignedTo) {
      if (!projectDoc.members.some(m => m.equals(assignedTo))) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo'
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin: all fields, Member: only status)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role === 'member') {
      if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      // Members can only update status
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    } else {
      // Admin can update everything
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    let filter = {};

    // Members only see stats for their projects
    if (req.user.role === 'member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      filter.project = { $in: memberProjects.map(p => p._id) };
    }

    const totalTasks = await Task.countDocuments(filter);
    const todoTasks = await Task.countDocuments({ ...filter, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...filter, status: 'in-progress' });
    const doneTasks = await Task.countDocuments({ ...filter, status: 'done' });
    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });
    const highPriorityTasks = await Task.countDocuments({ ...filter, priority: 'high', status: { $ne: 'done' } });

    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(5);

    const projectCount = req.user.role === 'admin'
      ? await Project.countDocuments()
      : await Project.countDocuments({ members: req.user._id });

    // Tasks per user aggregation (required by assignment)
    const tasksPerUserPipeline = [
      ...(filter.project ? [{ $match: { project: { $in: filter.project.$in || [filter.project] } } }] : []),
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', email: '$user.email', taskCount: '$count' } },
      { $sort: { taskCount: -1 } }
    ];
    const tasksPerUser = await Task.aggregate(tasksPerUserPipeline);

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      highPriorityTasks,
      projectCount,
      recentTasks,
      tasksPerUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
