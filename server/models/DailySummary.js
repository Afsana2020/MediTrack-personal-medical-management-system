const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    medicinesTaken: [{ drugName: String, timeSlot: String }],
    medicinesMissed: [{ drugName: String, timeSlot: String }],
    appointmentsCompleted: [{ doctorName: String, date: Date, time: String }],
    appointmentsMissed: [{ doctorName: String, date: Date, time: String }],
    summaryText: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailySummary', DailySummarySchema);