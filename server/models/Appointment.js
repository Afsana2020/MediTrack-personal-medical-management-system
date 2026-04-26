const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        default: ''
    },
    hospitalName: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    prescriptionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    }],
    prescriptionTitles: [{
        type: String,
        default: ''
    }],
    symptomIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Symptom'
    }],
    symptomNames: [{
        type: String,
        default: ''
    }],
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'missed'],
        default: 'scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);