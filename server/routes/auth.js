const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const CaregiverLink = require('../models/CaregiverLink');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role === 'caregiver' ? 'caregiver' : 'patient'
        });
        
        await user.save();
        
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//  caregiver info
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let caregiver = null;
        let patient = null;
        
        if (user.role === 'patient') {
            const link = await CaregiverLink.findOne({ patientId: user._id, isActive: true }).populate('caregiverId', '-password');
            if (link) caregiver = link.caregiverId;
        } else if (user.role === 'caregiver') {
            const link = await CaregiverLink.findOne({ caregiverId: user._id, isActive: true }).populate('patientId', '-password');
            if (link) patient = link.patientId;
        }
        
        res.json({ user, caregiver, patient });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update allergies
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
        console.error('Update allergies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;