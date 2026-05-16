const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all projects for user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Add task counts
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      const completedCount = await Task.countDocuments({ project: p._id, status: 'Done' });
      return { ...p.toObject(), taskCount, completedCount };
    }));

    res.json({ projects: projectsWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id
    }).populate('members.user', 'name email').populate('createdBy', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });

    await project.populate('members.user', 'name email');
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can update projects' });
    }

    const { name, description, color, status } = req.body;
    Object.assign(project, { name, description, color, status });
    await project.save();
    await project.populate('members.user', 'name email');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add member (Admin only)
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    const { email, role } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.find(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member (Admin only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    if (req.params.userId === project.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove project creator' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
