const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Search users by email (for adding to projects)
router.get('/search', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ users: [] });

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('name email').limit(5);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
