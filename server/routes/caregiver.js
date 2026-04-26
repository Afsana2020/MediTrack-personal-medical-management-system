const express = require('express');
const CaregiverLink = require('../models/CaregiverLink');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// caregivers and patient connectiom
router.get('/links', auth, async (req, res) => {
    try {
        const links = await CaregiverLink.find({ patientId: req.user.id, isActive: true });
        res.json(links);
    } catch (error) {
        console.error('Error getting links:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/patients', auth, async (req, res) => {
    try {
        const links = await CaregiverLink.find({ caregiverId: req.user.id, isActive: true }).populate('patientId', '-password');
        const patients = links.map(link => link.patientId).filter(p => p);
        res.json(patients);
    } catch (error) {
        console.error('Error getting patients:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//  caregiver email check
router.post('/check-email', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, role: 'caregiver' });
        if (user) {
            res.json({ exists: true, name: user.name });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// check registered caregiver
router.post('/link', auth, async (req, res) => {
    try {
        const { caregiverEmail, caregiverName } = req.body;
        
   
        let caregiver = await User.findOne({ email: caregiverEmail, role: 'caregiver' });
        
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found. They must register first.' });
        }
        
   
        const existingLink = await CaregiverLink.findOne({
            patientId: req.user.id,
            caregiverId: caregiver._id
        });
        
        if (existingLink) {
            return res.status(400).json({ message: 'Caregiver already linked' });
        }
        
        const link = new CaregiverLink({
            patientId: req.user.id,
            caregiverId: caregiver._id,
            caregiverName: caregiver.name,
            caregiverEmail: caregiver.email
        });
        await link.save();
        
        res.json({ message: 'Caregiver linked successfully', link });
    } catch (error) {
        console.error('Link caregiver error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove caregiver link
router.delete('/links/:id', auth, async (req, res) => {
    try {
        await CaregiverLink.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
        res.json({ message: 'Caregiver removed' });
    } catch (error) {
        console.error('Error removing caregiver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// all registered caregivers
router.get('/all', auth, async (req, res) => {
    try {
        const caregivers = await User.find({ role: 'caregiver' }).select('name email');
        res.json(caregivers);
    } catch (error) {
        console.error('Error getting caregivers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//  caregiver notifications
router.get('/notifications', auth, async (req, res) => {
    try {
        const link = await CaregiverLink.findOne({ caregiverId: req.user.id, isActive: true });
        if (!link) {
            return res.json([]);
        }
        
        const notifications = await Notification.find({ 
            userId: link.patientId,
            forCaregiver: true
        }).sort({ createdAt: -1 });
        
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;