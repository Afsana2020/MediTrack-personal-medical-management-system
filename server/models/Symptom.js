const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptom: { type: String, required: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
    duration: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    time: { type: String, default: '' },
    notes: { type: String, default: '' },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    isDiscussed: { type: Boolean, default: false }, // Whether discussed in appointment
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Symptom', SymptomSchema);