const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    category: { 
        type: String, 
        enum: ['cardiovascular', 'diabetes', 'respiratory', 'neurology', 'mental health',
                'cancer', 'autoimmune', 'digestive', 'infection', 'pain management',
                'thyroid', 'kidney', 'eye', 'skin', 'hormonal', 'vaccination', 'vitamins', 'other'],
        default: 'other'
    },
    doctorName: { type: String, default: '' },
    doctorSpecialty: { type: String, default: '' },
    hospitalName: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    notes: { type: String, default: '' },
    prescriptionDate: { type: Date, default: Date.now },
    followUpDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null }, // Link to appointment if prescribed during visit
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);