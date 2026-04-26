const mongoose = require('mongoose');

const MissedAppointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    caregiverNotified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissedAppointment', MissedAppointmentSchema);