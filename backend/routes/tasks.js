const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Helper: check if user is project member
const getProjectRole = (project, userId) => {
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Get all tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, 'members.user': req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my tasks (across all projects)
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project: projectId, tags } = req.body;

    const project = await Project.findOne({ _id: projectId, 'members.user': req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getProjectRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can create tasks' });

    const task = await Task.create({
      title, description, status, priority, dueDate, assignedTo, tags,
      project: projectId,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findOne({ _id: task.project, 'members.user': req.user._id });
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const role = getProjectRole(project, req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (role === 'Member') {
      if (!isAssigned) return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      // Members can only update status
      const { status } = req.body;
      if (status) task.status = status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (tags) task.tags = tags;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findOne({ _id: task.project, 'members.user': req.user._id });
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const role = getProjectRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
