const express = require('express');
const DailySummary = require('../models/DailySummary');
const CaregiverLink = require('../models/CaregiverLink');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/patient', auth, async (req, res) => {
    try {
        const link = await CaregiverLink.findOne({ caregiverId: req.user.id, isActive: true });
        if (!link) {
            return res.json([]);
        }
        
        const summaries = await DailySummary.find({ 
            patientId: link.patientId,
            caregiverId: req.user.id
        }).sort({ date: -1 });
        
        const patient = await User.findById(link.patientId);
        const summariesWithName = summaries.map(s => ({
            ...s.toObject(),
            patientName: patient?.name || 'Patient'
        }));
        
        res.json(summariesWithName);
    } catch (error) {
        console.error('Error fetching summaries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;