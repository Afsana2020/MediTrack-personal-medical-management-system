const express = require('express');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');
const router = express.Router();

//  all prescriptions
router.get('/', auth, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ userId: req.user.id }).sort({ prescriptionDate: -1 });
        res.json(prescriptions);
    } catch (error) {
        console.error('Error getting prescriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//single prescription with its medicines
router.get('/:id', auth, async (req, res) => {
    try {
        const prescription = await Prescription.findOne({ _id: req.params.id, userId: req.user.id });
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        
        const medicines = await Medicine.find({ prescriptionId: req.params.id, userId: req.user.id });
        
        res.json({ ...prescription.toObject(), medicines });
    } catch (error) {
        console.error('Error getting prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//prescription with medicines
router.post('/', auth, async (req, res) => {
    try {
        const { medicines, ...prescriptionData } = req.body;
        
        const prescription = new Prescription({
            userId: req.user.id,
            ...prescriptionData
        });
        await prescription.save();
        
        if (medicines && medicines.length > 0) {
            const medicineDocs = medicines.map(med => ({
                userId: req.user.id,
                prescriptionId: prescription._id,
                ...med
            }));
            await Medicine.insertMany(medicineDocs);
        }
        
        res.json(prescription);
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update prescription
router.put('/:id', auth, async (req, res) => {
    try {
        const { medicines, ...prescriptionData } = req.body;
        
        const prescription = await Prescription.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            prescriptionData,
            { new: true }
        );
        
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        
        if (medicines && medicines.length > 0) {
            await Medicine.deleteMany({ prescriptionId: req.params.id });
            const medicineDocs = medicines.map(med => ({
                userId: req.user.id,
                prescriptionId: prescription._id,
                ...med
            }));
            await Medicine.insertMany(medicineDocs);
        }
        
        res.json(prescription);
    } catch (error) {
        console.error('Error updating prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//  status change
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const { action, deactivateMedicines, activateMedicines } = req.body;
        const prescription = await Prescription.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        
        if (action === 'deactivate') {
            prescription.isActive = false;
            await prescription.save();
            
            if (deactivateMedicines && deactivateMedicines.length > 0) {
                await Medicine.updateMany(
                    { _id: { $in: deactivateMedicines }, userId: req.user.id },
                    { $set: { isActive: false } }
                );
            }
        } else if (action === 'activate') {
            prescription.isActive = true;
            await prescription.save();
            
            if (activateMedicines && activateMedicines.length > 0) {
                await Medicine.updateMany(
                    { _id: { $in: activateMedicines }, userId: req.user.id },
                    { $set: { isActive: true } }
                );
            }
        } else {
            
            prescription.isActive = !prescription.isActive;
            await prescription.save();
        }
        
        res.json({ 
            message: `Prescription ${prescription.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: prescription.isActive 
        });
    } catch (error) {
        console.error('Error toggling prescription status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete prescription and its medicines
router.delete('/:id', auth, async (req, res) => {
    try {
        await Medicine.deleteMany({ prescriptionId: req.params.id });
        await Prescription.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Prescription deleted' });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;