const express = require('express');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Symptom = require('../models/Symptom');
const MissedAppointment = require('../models/MissedAppointment');
const auth = require('../middleware/auth');
const router = express.Router();

// Auto-update missed appointments (runs on every GET)
const autoUpdateMissed = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const appointments = await Appointment.find({
            userId: userId,
            status: 'scheduled'
        });
        
        let count = 0;
        
        for (const apt of appointments) {
            let aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            
            if (aptDate < today) {
                apt.status = 'missed';
                await apt.save();
                count++;
                
                const existing = await MissedAppointment.findOne({ 
                    appointmentId: apt._id,
                    userId: userId
                });
                
                if (!existing) {
                    const missed = new MissedAppointment({
                        userId: userId,
                        appointmentId: apt._id,
                        doctorName: apt.doctorName,
                        scheduledDate: apt.date,
                        scheduledTime: apt.time
                    });
                    await missed.save();
                }
            }
        }
        return count;
    } catch (error) {
        console.error('Auto update error:', error);
        return 0;
    }
};

router.get('/', auth, async (req, res) => {
    try {
        await autoUpdateMissed(req.user.id);
        const appointments = await Appointment.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        await autoUpdateMissed(req.user.id);
        const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        
        const linkedPrescriptions = [];
        if (appointment.prescriptionIds && appointment.prescriptionIds.length > 0) {
            for (const presId of appointment.prescriptionIds) {
                const prescription = await Prescription.findOne({ _id: presId, userId: req.user.id });
                if (prescription) linkedPrescriptions.push(prescription);
            }
        }
        
        const linkedSymptoms = await Symptom.find({ 
            appointmentId: req.params.id, 
            userId: req.user.id 
        }).sort({ date: -1 });
        
        res.json({
            ...appointment.toObject(),
            linkedPrescriptions,
            linkedSymptoms
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { doctorName, specialty, hospitalName, date, time, notes, prescriptionIds, prescriptionTitles, symptomIds } = req.body;
        
        const appointment = new Appointment({
            userId: req.user.id,
            doctorName,
            specialty: specialty || '',
            hospitalName: hospitalName || '',
            date,
            time,
            notes: notes || '',
            prescriptionIds: prescriptionIds || [],
            prescriptionTitles: prescriptionTitles || [],
            symptomIds: symptomIds || [],
            status: 'scheduled'
        });
        
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { doctorName, specialty, hospitalName, date, time, notes, prescriptionIds, prescriptionTitles, symptomIds, status } = req.body;
        
        // Prevent manually setting 'missed' status
        let finalStatus = status;
        if (status === 'missed') {
            finalStatus = 'scheduled';
        }
        
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                doctorName,
                specialty: specialty || '',
                hospitalName: hospitalName || '',
                date,
                time,
                notes: notes || '',
                prescriptionIds: prescriptionIds || [],
                prescriptionTitles: prescriptionTitles || [],
                symptomIds: symptomIds || [],
                status: finalStatus
            },
            { new: true }
        );
        
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        
        await autoUpdateMissed(req.user.id);
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/complete', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: 'completed' },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Symptom.updateMany(
            { appointmentId: req.params.id },
            { $set: { appointmentId: null, appointmentTitle: '' } }
        );
        await MissedAppointment.findOneAndDelete({ appointmentId: req.params.id, userId: req.user.id });
        const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ message: 'Appointment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/check-missed', auth, async (req, res) => {
    try {
        const count = await autoUpdateMissed(req.user.id);
        res.json({ message: 'Checked missed appointments', updatedCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;