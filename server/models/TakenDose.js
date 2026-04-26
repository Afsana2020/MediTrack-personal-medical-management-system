const mongoose = require('mongoose');

const TakenDoseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    drugName: { type: String, required: true },
    timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
    takenDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TakenDose', TakenDoseSchema);