const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', default: null },
    drugName: { type: String, required: true },
    strength: { type: String, default: '' },
    morning: { type: Number, default: 0 },
    afternoon: { type: Number, default: 0 },
    evening: { type: Number, default: 0 },
    night: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    timingWithFood: { type: String, default: 'no restriction' },
    specialInstructions: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastMorningCheck: { type: Date, default: null },
    lastAfternoonCheck: { type: Date, default: null },
    lastEveningCheck: { type: Date, default: null },
    lastNightCheck: { type: Date, default: null }
});

// deactivate when endDate
MedicineSchema.pre('save', function() {
    if (this.endDate && this.endDate < new Date()) {
        this.isActive = false;
    }
});

//  pending missed dose 
MedicineSchema.post('save', async function(doc) {
    try {
        const MissedDose = require('../models/MissedDose');
        const timeSlots = ['morning', 'afternoon', 'evening', 'night'];
        
        for (const slot of timeSlots) {
            let doseCount = 0;
            if (slot === 'morning') doseCount = doc.morning;
            else if (slot === 'afternoon') doseCount = doc.afternoon;
            else if (slot === 'evening') doseCount = doc.evening;
            else if (slot === 'night') doseCount = doc.night;
            
            if (doseCount > 0) {
                const existing = await MissedDose.findOne({
                    userId: doc.userId,
                    medicineId: doc._id,
                    timeSlot: slot,
                    isResolved: false
                });
                
                if (!existing) {
                    const missed = new MissedDose({
                        userId: doc.userId,
                        medicineId: doc._id,
                        drugName: doc.drugName,
                        timeSlot: slot,
                        expectedDate: new Date(),
                        isResolved: false,
                        isConfirmed: false
                    });
                    await missed.save();
                    console.log(`Pending missed dose created for ${doc.drugName} - ${slot}`);
                }
            }
        }
    } catch (error) {
        console.error('Error creating pending missed doses:', error);
    }
});

module.exports = mongoose.model('Medicine', MedicineSchema);