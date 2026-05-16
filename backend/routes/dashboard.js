const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    // Get user's projects
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    // Get tasks based on role
    const myProjects = projects.filter(p => {
      const m = p.members.find(m => m.user.toString() === req.user._id.toString());
      return m && m.role === 'Admin';
    });
    const memberProjects = projects.filter(p => {
      const m = p.members.find(m => m.user.toString() === req.user._id.toString());
      return m && m.role === 'Member';
    });

    // All tasks in user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name color');

    // Tasks assigned to user
    const myTasks = allTasks.filter(t => t.assignedTo && t.assignedTo._id.toString() === req.user._id.toString());

    const now = new Date();

    // Stats
    const totalTasks = allTasks.length;
    const todoCount = allTasks.filter(t => t.status === 'To Do').length;
    const inProgressCount = allTasks.filter(t => t.status === 'In Progress').length;
    const doneCount = allTasks.filter(t => t.status === 'Done').length;
    const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

    // Tasks per user (for admin projects)
    const adminProjectIds = myProjects.map(p => p._id.toString());
    const adminTasks = allTasks.filter(t => adminProjectIds.includes(t.project._id.toString()));
    
    const userTaskMap = {};
    adminTasks.forEach(t => {
      if (t.assignedTo) {
        const key = t.assignedTo._id.toString();
        if (!userTaskMap[key]) {
          userTaskMap[key] = { name: t.assignedTo.name, email: t.assignedTo.email, count: 0, done: 0 };
        }
        userTaskMap[key].count++;
        if (t.status === 'Done') userTaskMap[key].done++;
      }
    });

    const tasksPerUser = Object.values(userTaskMap);

    // Recent overdue tasks
    const overdueTasks = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Recent tasks
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todoCount,
        inProgressCount,
        doneCount,
        overdueCount,
        myTasksCount: myTasks.length
      },
      tasksPerUser,
      overdueTasks,
      recentTasks,
      statusBreakdown: [
        { name: 'To Do', value: todoCount, color: '#94a3b8' },
        { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
        { name: 'Done', value: doneCount, color: '#10b981' }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
