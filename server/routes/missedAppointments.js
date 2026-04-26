const express = require('express');
const MissedAppointment = require('../models/MissedAppointment');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const { createMissedAppointmentNotification } = require('./notifications');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const missed = await MissedAppointment.find({ 
            userId: req.user.id, 
            isResolved: false 
        }).populate('appointmentId');
        
        const unique = {};
        missed.forEach(m => {
            if (m.appointmentId && !unique[m.appointmentId._id]) {
                unique[m.appointmentId._id] = m;
            } else if (!m.appointmentId && !unique[m._id]) {
                unique[m._id] = m;
            }
        });
        
        res.json(Object.values(unique));
    } catch (error) {
        console.error('Error getting missed appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/resolve', auth, async (req, res) => {
    try {
        const missed = await MissedAppointment.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!missed) {
            return res.status(404).json({ message: 'Missed appointment not found' });
        }
        
        missed.isResolved = true;
        await missed.save();
        
        if (missed.appointmentId) {
            await Appointment.findByIdAndUpdate(missed.appointmentId, { status: 'completed' });
        }
        
        res.json({ message: 'Appointment marked as attended' });
    } catch (error) {
        console.error('Error resolving missed appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await MissedAppointment.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!result) {
            return res.status(404).json({ message: 'Missed appointment not found' });
        }
        
        res.json({ message: 'Missed appointment deleted' });
    } catch (error) {
        console.error('Error deleting missed appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/check-missed', auth, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const missedAppointments = [];
        
        let appointments = await Appointment.find({
            userId: req.user.id
        });
        
        const passedAppointments = appointments.filter(appt => {
            let apptDate;
            if (appt.date instanceof Date) {
                apptDate = new Date(appt.date);
            } else if (typeof appt.date === 'string') {
                apptDate = new Date(appt.date);
            } else {
                return false;
            }
            
            const apptDateOnly = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate());
            
            return apptDateOnly < today && appt.status !== 'completed' && appt.status !== 'cancelled';
        });
        
        console.log(`Found ${passedAppointments.length} passed appointments that need checking`);
        
        for (const appointment of passedAppointments) {
            let existing = await MissedAppointment.findOne({ 
                appointmentId: appointment._id,
                userId: req.user.id
            });
            
            if (!existing) {
                const missed = new MissedAppointment({
                    userId: req.user.id,
                    appointmentId: appointment._id,
                    doctorName: appointment.doctorName,
                    scheduledDate: appointment.date,
                    scheduledTime: appointment.time
                });
                await missed.save();
                missedAppointments.push(missed);
                
                appointment.status = 'missed';
                await appointment.save();
                
                console.log(`Marked appointment with Dr. ${appointment.doctorName} from ${appointment.date} as missed`);
                
                await createMissedAppointmentNotification(req.user.id, appointment.doctorName, appointment.date);
            } else if (existing && appointment.status !== 'missed') {
                appointment.status = 'missed';
                await appointment.save();
                console.log(`Updated appointment status to missed for Dr. ${appointment.doctorName}`);
            }
        }
        
        res.json({ 
            message: `Checked missed appointments`, 
            count: missedAppointments.length,
            totalPassed: passedAppointments.length
        });
    } catch (error) {
        console.error('Error checking missed appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/force-check', auth, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let updatedCount = 0;
        
        const appointments = await Appointment.find({
            userId: req.user.id,
            status: 'scheduled'
        });
        
        for (const appointment of appointments) {
            let apptDate;
            if (appointment.date instanceof Date) {
                apptDate = new Date(appointment.date);
            } else if (typeof appointment.date === 'string') {
                apptDate = new Date(appointment.date);
            } else {
                continue;
            }
            
            const apptDateOnly = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate());
            
            if (apptDateOnly < today) {
                appointment.status = 'missed';
                await appointment.save();
                updatedCount++;
                
                const existing = await MissedAppointment.findOne({ 
                    appointmentId: appointment._id,
                    userId: req.user.id
                });
                
                if (!existing) {
                    const missed = new MissedAppointment({
                        userId: req.user.id,
                        appointmentId: appointment._id,
                        doctorName: appointment.doctorName,
                        scheduledDate: appointment.date,
                        scheduledTime: appointment.time
                    });
                    await missed.save();
                    await createMissedAppointmentNotification(req.user.id, appointment.doctorName, appointment.date);
                }
            }
        }
        
        res.json({ 
            message: `Force check completed`, 
            updatedCount: updatedCount,
            totalChecked: appointments.length
        });
    } catch (error) {
        console.error('Error in force check:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;