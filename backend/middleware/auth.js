const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Check if user is admin of the project
const isProjectAdmin = (Project) => async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can perform this action' });
    }

    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { protect, isProjectAdmin };
