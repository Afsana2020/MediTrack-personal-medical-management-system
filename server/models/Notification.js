const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['medicine_inactive', 'missed_dose', 'missed_appointment', 'medicine_expiring', 'appointment_reminder', 'daily_summary', 'appointment_upcoming'],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
    forCaregiver: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);