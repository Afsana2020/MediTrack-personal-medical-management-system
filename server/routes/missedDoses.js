const express = require('express');
const MissedDose = require('../models/MissedDose');
const Medicine = require('../models/Medicine');
const TakenDose = require('../models/TakenDose');
const auth = require('../middleware/auth');
const createMissedDoseNotification = require('./notifications').createMissedDoseNotification;
const router = express.Router();

//all cornfirmed missed doses 
router.get('/', auth, async (req, res) => {
    try {
        const missedDoses = await MissedDose.find({ 
            userId: req.user.id, 
            isResolved: false
        }).sort({ expectedDate: -1 });
        res.json(missedDoses);
    } catch (error) {
        console.error('Error getting missed doses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// mark taken
router.post('/take', auth, async (req, res) => {
    try {
        const { medicineId, timeSlot, drugName } = req.body;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await MissedDose.findOneAndDelete({
            userId: req.user.id,
            medicineId: medicineId,
            timeSlot: timeSlot,
            expectedDate: { $gte: today }
        });
        
        await TakenDose.findOneAndDelete({
            userId: req.user.id,
            medicineId: medicineId,
            timeSlot: timeSlot,
            takenDate: { $gte: today }
        });
        
        const takenDose = new TakenDose({
            userId: req.user.id,
            medicineId: medicineId,
            drugName: drugName,
            timeSlot: timeSlot,
            takenDate: new Date()
        });
        await takenDose.save();
        
        res.json({ message: 'Dose marked as taken' });
    } catch (error) {
        console.error('Error marking dose as taken:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// undo missed
router.post('/:id/confirm-taken', auth, async (req, res) => {
    try {
        const missed = await MissedDose.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!missed) {
            return res.status(404).json({ message: 'Missed dose not found' });
        }
        
        missed.isResolved = true;
        missed.userConfirmed = true;
        await missed.save();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await TakenDose.findOneAndDelete({
            userId: req.user.id,
            medicineId: missed.medicineId,
            timeSlot: missed.timeSlot,
            takenDate: { $gte: today }
        });
        
        const takenDose = new TakenDose({
            userId: req.user.id,
            medicineId: missed.medicineId,
            drugName: missed.drugName,
            timeSlot: missed.timeSlot,
            takenDate: new Date()
        });
        await takenDose.save();
        
        res.json({ message: 'Confirmed as taken' });
    } catch (error) {
        console.error('Error confirming taken:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete 
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await MissedDose.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!result) {
            return res.status(404).json({ message: 'Missed dose not found' });
        }
        
        res.json({ message: 'Missed dose deleted' });
    } catch (error) {
        console.error('Error deleting missed dose:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//status  update based on time
router.post('/update-status', auth, async (req, res) => {
    try {
        const currentHour = new Date().getHours();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const medicines = await Medicine.find({ userId: req.user.id, isActive: true });
        
        const timeSlots = [
            { name: 'morning', field: 'morning', endHour: 12, checkField: 'lastMorningCheck' },
            { name: 'afternoon', field: 'afternoon', endHour: 17, checkField: 'lastAfternoonCheck' },
            { name: 'evening', field: 'evening', endHour: 21, checkField: 'lastEveningCheck' },
            { name: 'night', field: 'night', endHour: 6, checkField: 'lastNightCheck' }
        ];
        
        let missedCount = 0;
        
        for (const medicine of medicines) {
            for (const slot of timeSlots) {
                const doseCount = medicine[slot.field];
                if (doseCount === 0) continue;
                
                const lastCheck = medicine[slot.checkField];
                const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
                const needsCheck = !lastCheckDate || lastCheckDate < today;
                
                if (needsCheck) {
                    let hasPassed = false;
                    
                    if (slot.name === 'night') {
                        hasPassed = currentHour >= 6 && currentHour < 12;
                    } else {
                        hasPassed = currentHour >= slot.endHour;
                    }
                    
                    if (hasPassed) {
                        const takenOnDay = await TakenDose.findOne({
                            userId: req.user.id,
                            medicineId: medicine._id,
                            timeSlot: slot.name,
                            takenDate: { $gte: today }
                        });
                        
                        if (!takenOnDay) {
                            const existing = await MissedDose.findOne({
                                userId: req.user.id,
                                medicineId: medicine._id,
                                timeSlot: slot.name,
                                expectedDate: { $gte: today }
                            });
                            
                            if (!existing) {
                                const missed = new MissedDose({
                                    userId: req.user.id,
                                    medicineId: medicine._id,
                                    drugName: medicine.drugName,
                                    timeSlot: slot.name,
                                    expectedDate: today,
                                    isResolved: false,
                                    isConfirmed: true
                                });
                                await missed.save();
                                missedCount++;
                                
                             
                                await createMissedDoseNotification(req.user.id, medicine.drugName, slot.name);
                            }
                        }
                        
                        medicine[slot.checkField] = new Date();
                        await medicine.save();
                    }
                }
            }
        }
        
        res.json({ message: `Updated missed doses`, count: missedCount });
    } catch (error) {
        console.error('Error updating missed doses:', error);
        res.status(500).json({ error: error.message });
    }
});

// missed doses check
router.post('/check-missed', auth, async (req, res) => {
    try {
        const result = await fetch(`http://localhost:${process.env.PORT || 5000}/api/missed-doses/update-status`, {
            method: 'POST',
            headers: { 'x-auth-token': req.headers['x-auth-token'] }
        });
        const data = await result.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/force-check', auth, async (req, res) => {
    try {
        const MissedDose = require('../models/MissedDose');
        const Medicine = require('../models/Medicine');
        const TakenDose = require('../models/TakenDose');
        
        const currentHour = new Date().getHours();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const timeSlots = [
            { name: 'morning', endHour: 12 },
            { name: 'afternoon', endHour: 17 },
            { name: 'evening', endHour: 21 },
            { name: 'night', endHour: 6 }
        ];
        
        let created = 0;
        const medicines = await Medicine.find({ userId: req.user.id, isActive: true });
        
        for (const medicine of medicines) {
            for (const slot of timeSlots) {
                let doseCount = 0;
                if (slot.name === 'morning') doseCount = medicine.morning;
                else if (slot.name === 'afternoon') doseCount = medicine.afternoon;
                else if (slot.name === 'evening') doseCount = medicine.evening;
                else if (slot.name === 'night') doseCount = medicine.night;
                
                if (doseCount === 0) continue;
                
                let shouldCreate = false;
                if (slot.name === 'night') {
                    shouldCreate = currentHour >= 6;
                } else {
                    shouldCreate = currentHour >= slot.endHour;
                }
                
                if (shouldCreate) {
                    const takenToday = await TakenDose.findOne({
                        userId: req.user.id,
                        medicineId: medicine._id,
                        timeSlot: slot.name,
                        takenDate: { $gte: today }
                    });
                    
                    if (!takenToday) {
                        const existing = await MissedDose.findOne({
                            userId: req.user.id,
                            medicineId: medicine._id,
                            timeSlot: slot.name,
                            expectedDate: { $gte: today }
                        });
                        
                        if (!existing) {
                            const missed = new MissedDose({
                                userId: req.user.id,
                                medicineId: medicine._id,
                                drugName: medicine.drugName,
                                timeSlot: slot.name,
                                expectedDate: today,
                                isResolved: false,
                                isConfirmed: true
                            });
                            await missed.save();
                            created++;
                            console.log(`Force-check created: ${medicine.drugName} - ${slot.name}`);
                        }
                    }
                }
            }
        }
        
        res.json({ message: 'Force check completed', created: created });
    } catch (error) {
        console.error('Force check error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/sync-missed', auth, async (req, res) => {
    try {
        const MissedDose = require('../models/MissedDose');
        const Medicine = require('../models/Medicine');
        const TakenDose = require('../models/TakenDose');
        
        const currentHour = new Date().getHours();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const medicines = await Medicine.find({ userId: req.user.id, isActive: true });
        let created = 0;
        
        const slots = [
            { name: 'morning', getDose: (m) => m.morning, endHour: 12 },
            { name: 'afternoon', getDose: (m) => m.afternoon, endHour: 17 },
            { name: 'evening', getDose: (m) => m.evening, endHour: 21 },
            { name: 'night', getDose: (m) => m.night, endHour: 6 }
        ];
        
        for (const medicine of medicines) {
            for (const slot of slots) {
                const doseCount = slot.getDose(medicine);
                if (doseCount === 0) continue;
                
                let shouldCreate = false;
                if (slot.name === 'night') {
                    shouldCreate = currentHour >= 6;
                } else {
                    shouldCreate = currentHour >= slot.endHour;
                }
                
                if (shouldCreate) {
                    const taken = await TakenDose.findOne({
                        userId: req.user.id,
                        medicineId: medicine._id,
                        timeSlot: slot.name,
                        takenDate: { $gte: today }
                    });
                    
                    if (!taken) {
                        const existing = await MissedDose.findOne({
                            userId: req.user.id,
                            medicineId: medicine._id,
                            timeSlot: slot.name,
                            expectedDate: { $gte: today }
                        });
                        
                        if (!existing) {
                            const missed = new MissedDose({
                                userId: req.user.id,
                                medicineId: medicine._id,
                                drugName: medicine.drugName,
                                timeSlot: slot.name,
                                expectedDate: today,
                                isResolved: false,
                                isConfirmed: true
                            });
                            await missed.save();
                            created++;
                        }
                    }
                }
            }
        }
        
        res.json({ message: 'Missed doses synced', created: created });
    } catch (error) {
        console.error('Sync missed doses error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;