const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// update user allergies
router.put('/allergies', auth, async (req, res) => {
    try {
        const { allergies } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { allergies: allergies || [] },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Error updating allergies:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;