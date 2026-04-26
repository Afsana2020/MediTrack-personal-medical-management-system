const express = require('express');
const Notification = require('../models/Notification');
const MissedDose = require('../models/MissedDose');
const MissedAppointment = require('../models/MissedAppointment');
const DailySummary = require('../models/DailySummary');
const auth = require('../middleware/auth');
const router = express.Router();

// all notifications for user 
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            userId: req.user.id,
            forCaregiver: false
        }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.user.id, 
            isRead: false,
            forCaregiver: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false, forCaregiver: false },
            { isRead: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//  caregiver notifications
router.get('/caregiver', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            userId: req.user.id,
            forCaregiver: true
        }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create missed dose notification
const createMissedDoseNotification = async (userId, drugName, timeSlot) => {
    try {
        const existing = await Notification.findOne({
            userId,
            type: 'missed_dose',
            relatedId: null,
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        
        if (!existing) {
            const notification = new Notification({
                userId,
                type: 'missed_dose',
                title: 'Missed Medication',
                message: `You missed your ${timeSlot} dose of ${drugName}. Please take it as soon as possible.`,
                isRead: false,
                forCaregiver: false
            });
            await notification.save();
        }
    } catch (error) {
        console.error('Error creating missed dose notification:', error);
    }
};

//missed appointment notification
const createMissedAppointmentNotification = async (userId, doctorName, date) => {
    try {
        const notification = new Notification({
            userId,
            type: 'missed_appointment',
            title: 'Missed Appointment',
            message: `You missed your appointment with Dr. ${doctorName} on ${new Date(date).toLocaleDateString()}. Please reschedule.`,
            isRead: false,
            forCaregiver: false
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating missed appointment notification:', error);
    }
};

//  daily summary for caregiver
const createDailySummaryNotification = async (caregiverId, patientName, summaryText, isGood) => {
    try {
        const notification = new Notification({
            userId: caregiverId,
            type: 'daily_summary',
            title: `Daily Health Summary - ${patientName}`,
            message: summaryText,
            isRead: false,
            forCaregiver: true
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating daily summary notification:', error);
    }
};


module.exports = router;
module.exports.createMissedDoseNotification = createMissedDoseNotification;
module.exports.createMissedAppointmentNotification = createMissedAppointmentNotification;
module.exports.createDailySummaryNotification = createDailySummaryNotification;