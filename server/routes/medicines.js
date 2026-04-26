const express = require('express');
const Medicine = require('../models/Medicine');
const TakenDose = require('../models/TakenDose');
const MissedDose = require('../models/MissedDose');
const auth = require('../middleware/auth');
const router = express.Router();

// all medicines
router.get('/', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(medicines);
    } catch (error) {
        console.error('Error getting medicines:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// single medicine by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user.id });
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.json(medicine);
    } catch (error) {
        console.error('Error getting medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// medicines by prescription ID
router.get('/prescription/:prescriptionId', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find({ 
            userId: req.user.id, 
            prescriptionId: req.params.prescriptionId 
        });
        res.json(medicines);
    } catch (error) {
        console.error('Error getting medicines by prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// medicines for current time slot 
router.get('/timeslot/:slot', auth, async (req, res) => {
    try {
        const { slot } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const query = { userId: req.user.id, isActive: true };
        
        if (slot === 'morning') query.morning = { $gt: 0 };
        else if (slot === 'afternoon') query.afternoon = { $gt: 0 };
        else if (slot === 'evening') query.evening = { $gt: 0 };
        else if (slot === 'night') query.night = { $gt: 0 };
        
        let medicines = await Medicine.find(query);
        
        const takenDoses = await TakenDose.find({
            userId: req.user.id,
            timeSlot: slot,
            takenDate: { $gte: today, $lt: tomorrow }
        });
        
        const takenMedicineIds = takenDoses.map(t => t.medicineId.toString());
        
        medicines = medicines.filter(med => !takenMedicineIds.includes(med._id.toString()));
        
        res.json(medicines);
    } catch (error) {
        console.error('Error getting medicines by timeslot:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create medicine
router.post('/', auth, async (req, res) => {
    try {
        const medicine = new Medicine({
            userId: req.user.id,
            prescriptionId: req.body.prescriptionId || null,
            drugName: req.body.drugName,
            strength: req.body.strength || '',
            morning: req.body.morning || 0,
            afternoon: req.body.afternoon || 0,
            evening: req.body.evening || 0,
            night: req.body.night || 0,
            duration: req.body.duration || 0,
            timingWithFood: req.body.timingWithFood || 'no restriction',
            specialInstructions: req.body.specialInstructions || '',
            startDate: req.body.startDate || Date.now(),
            endDate: req.body.endDate || null,
            isActive: true
        });
        
        await medicine.save();
        res.json(medicine);
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update medicine
router.put('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json(medicine);
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// medicine active status
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user.id });
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        
        medicine.isActive = !medicine.isActive;
        await medicine.save();
        res.json(medicine);
    } catch (error) {
        console.error('Error toggling medicine status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;