const mongoose = require('mongoose');

const MissedDoseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    drugName: { type: String, required: true },
    timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
    expectedDate: { type: Date, required: true },
    isResolved: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
    userConfirmed: { type: Boolean, default: false },
    caregiverNotified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissedDose', MissedDoseSchema);