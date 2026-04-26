const express = require('express');
const Symptom = require('../models/Symptom');
const auth = require('../middleware/auth');
const router = express.Router();

// all symptoms
router.get('/', auth, async (req, res) => {
    try {
        const symptoms = await Symptom.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// single symptom
router.get('/:id', auth, async (req, res) => {
    try {
        const symptom = await Symptom.findOne({ _id: req.params.id, userId: req.user.id });
        if (!symptom) return res.status(404).json({ message: 'Symptom not found' });
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create 
router.post('/', auth, async (req, res) => {
    try {
        const symptom = new Symptom({
            userId: req.user.id,
            ...req.body
        });
        await symptom.save();
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update 
router.put('/:id', auth, async (req, res) => {
    try {
        const symptom = await Symptom.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete 
router.delete('/:id', auth, async (req, res) => {
    try {
        await Symptom.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Symptom deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// symptom discuss 
router.patch('/:id/discuss', auth, async (req, res) => {
    try {
        const symptom = await Symptom.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isDiscussed: true },
            { new: true }
        );
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;