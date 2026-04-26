 const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const appointmentRoutes = require('./routes/appointments');
const symptomRoutes = require('./routes/symptoms');
const interactionRoutes = require('./routes/interactions');
const missedDoseRoutes = require('./routes/missedDoses');
const missedAppointmentRoutes = require('./routes/missedAppointments');
const notificationRoutes = require('./routes/notifications');
const dailySummaryRoutes = require('./routes/dailySummary');
const caregiverRoutes = require('./routes/caregiver');
const updateExpiredMedicines = require('./jobs/updateExpiredMedicines');
const userRoutes = require('./routes/users');

dotenv.config();
connectDB();

const backfillMissedDoses = async () => {
    try {
        console.log('Backfilling past missed doses...');
        
        const MissedDose = require('./models/MissedDose');
        const Medicine = require('./models/Medicine');
        const TakenDose = require('./models/TakenDose');
        const User = require('./models/User');
        
        const users = await User.find();
        const timeSlots = [
            { name: 'morning', endHour: 12 },
            { name: 'afternoon', endHour: 17 },
            { name: 'evening', endHour: 21 },
            { name: 'night', endHour: 6 }
        ];
        
        let totalCreated = 0;
        const currentHour = new Date().getHours();
        
        for (const user of users) {
            const medicines = await Medicine.find({ userId: user._id, isActive: true });
            
            for (const medicine of medicines) {
                for (const slot of timeSlots) {
                    let doseCount = 0;
                    if (slot.name === 'morning') doseCount = medicine.morning;
                    else if (slot.name === 'afternoon') doseCount = medicine.afternoon;
                    else if (slot.name === 'evening') doseCount = medicine.evening;
                    else if (slot.name === 'night') doseCount = medicine.night;
                    
                    if (doseCount === 0) continue;
                    
                    let startDate = medicine.startDate;
                    if (startDate instanceof Date) {
                        startDate = new Date(startDate);
                    } else if (typeof startDate === 'string') {
                        startDate = new Date(startDate);
                    }
                    startDate.setHours(0, 0, 0, 0);
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const takenRecords = await TakenDose.find({
                        userId: user._id,
                        medicineId: medicine._id,
                        timeSlot: slot.name
                    });
                    
                    const takenDates = new Set();
                    takenRecords.forEach(record => {
                        const date = new Date(record.takenDate);
                        date.setHours(0, 0, 0, 0);
                        takenDates.add(date.getTime());
                    });
                    
                    const existingMissed = await MissedDose.find({
                        userId: user._id,
                        medicineId: medicine._id,
                        timeSlot: slot.name
                    });
                    
                    const missedDates = new Set();
                    existingMissed.forEach(record => {
                        const date = new Date(record.expectedDate);
                        date.setHours(0, 0, 0, 0);
                        missedDates.add(date.getTime());
                    });
                    
                    let currentDate = new Date(startDate);
                    
                    while (currentDate <= today) {
                        const isToday = currentDate.getTime() === today.getTime();
                        let shouldCreate = true;
                        
                        if (isToday) {
                            if (slot.name === 'night') {
                                shouldCreate = currentHour >= 6;
                            } else {
                                shouldCreate = currentHour >= slot.endHour;
                            }
                        }
                        
                        const dateTime = currentDate.getTime();
                        
                        if (shouldCreate && !takenDates.has(dateTime) && !missedDates.has(dateTime)) {
                            const missed = new MissedDose({
                                userId: user._id,
                                medicineId: medicine._id,
                                drugName: medicine.drugName,
                                timeSlot: slot.name,
                                expectedDate: new Date(currentDate),
                                isResolved: false,
                                isConfirmed: true
                            });
                            await missed.save();
                            totalCreated++;
                        }
                        
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }
        }
        
        console.log(`Backfill complete. Created ${totalCreated} missed dose records.`);
    } catch (error) {
        console.error('Error backfilling missed doses:', error);
    }
};

const autoCheckMissedDoses = async () => {
    try {
        const MissedDose = require('./models/MissedDose');
        const Medicine = require('./models/Medicine');
        const TakenDose = require('./models/TakenDose');
        const User = require('./models/User');
        
        const users = await User.find();
        const currentHour = new Date().getHours();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const timeSlots = [
            { name: 'morning', endHour: 12 },
            { name: 'afternoon', endHour: 17 },
            { name: 'evening', endHour: 21 },
            { name: 'night', endHour: 6 }
        ];
        
        let totalCreated = 0;
        
        for (const user of users) {
            const medicines = await Medicine.find({ userId: user._id, isActive: true });
            
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
                            userId: user._id,
                            medicineId: medicine._id,
                            timeSlot: slot.name,
                            takenDate: { $gte: today }
                        });
                        
                        if (!takenToday) {
                            const existing = await MissedDose.findOne({
                                userId: user._id,
                                medicineId: medicine._id,
                                timeSlot: slot.name,
                                expectedDate: { $gte: today }
                            });
                            
                            if (!existing) {
                                const missed = new MissedDose({
                                    userId: user._id,
                                    medicineId: medicine._id,
                                    drugName: medicine.drugName,
                                    timeSlot: slot.name,
                                    expectedDate: today,
                                    isResolved: false,
                                    isConfirmed: true
                                });
                                await missed.save();
                                totalCreated++;
                            }
                        }
                    }
                }
            }
        }
        
        if (totalCreated > 0) {
            console.log(`Auto-check created ${totalCreated} missed doses`);
        }
    } catch (error) {
        console.error('Auto-check error:', error);
    }
};

const createDailySummaryForDate = async (targetDate) => {
    const DailySummary = require('./models/DailySummary');
    const MissedDose = require('./models/MissedDose');
    const MissedAppointment = require('./models/MissedAppointment');
    const Appointment = require('./models/Appointment');
    const Medicine = require('./models/Medicine');
    const TakenDose = require('./models/TakenDose');
    const CaregiverLink = require('./models/CaregiverLink');
    const Notification = require('./models/Notification');
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const links = await CaregiverLink.find({ isActive: true });
    let created = 0;
    
    for (const link of links) {
        const patientId = link.patientId;
        const caregiverId = link.caregiverId;
        
        const existing = await DailySummary.findOne({
            patientId,
            caregiverId,
            date: { $gte: startOfDay, $lt: endOfDay }
        });
        
        if (existing) continue;
        
        const missedDoses = await MissedDose.find({
            userId: patientId,
            expectedDate: { $gte: startOfDay, $lt: endOfDay },
            isResolved: false
        });
        
        const takenDoses = await TakenDose.find({
            userId: patientId,
            takenDate: { $gte: startOfDay, $lt: endOfDay }
        });
        
        const completedAppointments = await Appointment.find({
            userId: patientId,
            date: { $gte: startOfDay, $lt: endOfDay },
            status: 'completed'
        });
        
        const missedAppointments = await MissedAppointment.find({
            userId: patientId,
            scheduledDate: { $gte: startOfDay, $lt: endOfDay },
            isResolved: false
        }).populate('appointmentId');
        
        const takenMedicineIds = new Set(takenDoses.map(t => t.medicineId.toString()));
        const takenMeds = [];
        
        if (takenMedicineIds.size > 0) {
            const medicines = await Medicine.find({ _id: { $in: Array.from(takenMedicineIds) } });
            takenMeds.push(...medicines);
        }
        
        const hasAnyData = missedDoses.length > 0 || takenDoses.length > 0 || completedAppointments.length > 0 || missedAppointments.length > 0;
        
        if (!hasAnyData) continue;
        
        let summaryText = '';
        if (missedDoses.length === 0 && missedAppointments.length === 0) {
            summaryText = 'All good! All medications were taken and appointments were kept.';
        } else {
            if (missedDoses.length > 0) {
                const uniqueMeds = [...new Map(missedDoses.map(m => [m.drugName, m])).values()];
                summaryText += `Missed medications: ${uniqueMeds.map(m => m.drugName).join(', ')}. `;
            }
            if (missedAppointments.length > 0) {
                const uniqueAppts = [...new Map(missedAppointments.map(a => [a.doctorName, a])).values()];
                summaryText += `Missed appointments: ${uniqueAppts.map(a => a.doctorName).join(', ')}. `;
            }
            if (takenMeds.length > 0) {
                summaryText += `Taken: ${takenMeds.map(m => m.drugName).join(', ')}. `;
            }
            if (completedAppointments.length > 0) {
                summaryText += `Attended: ${completedAppointments.map(a => a.doctorName).join(', ')}. `;
            }
        }
        
        const uniqueMissedDoses = [...new Map(missedDoses.map(m => [m.drugName + m.timeSlot, m])).values()];
        const uniqueTakenMeds = [...new Map(takenMeds.map(m => [m.drugName, m])).values()];
        
        const summary = new DailySummary({
            patientId,
            caregiverId,
            date: startOfDay,
            medicinesTaken: uniqueTakenMeds.map(m => ({ drugName: m.drugName, timeSlot: 'various' })),
            medicinesMissed: uniqueMissedDoses.map(m => ({ drugName: m.drugName, timeSlot: m.timeSlot })),
            appointmentsCompleted: completedAppointments.map(a => ({ doctorName: a.doctorName, date: a.date, time: a.time })),
            appointmentsMissed: missedAppointments.map(m => ({ doctorName: m.doctorName, date: m.scheduledDate, time: m.scheduledTime })),
            summaryText
        });
        await summary.save();
        created++;
        
        const notification = new Notification({
            userId: caregiverId,
            type: 'daily_summary',
            title: `Daily Health Summary - ${startOfDay.toDateString()}`,
            message: summaryText,
            forCaregiver: true
        });
        await notification.save();
    }
    
    return created;
};

const backfillDailySummaries = async () => {
    try {
        console.log('Backfilling daily summaries...');
        
        const Medicine = require('./models/Medicine');
        const TakenDose = require('./models/TakenDose');
        const MissedDose = require('./models/MissedDose');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allTakenDoses = await TakenDose.find().sort({ takenDate: 1 });
        const allMissedDoses = await MissedDose.find().sort({ expectedDate: 1 });
        
        let oldestDate = today;
        
        if (allTakenDoses.length > 0) {
            const firstTaken = new Date(allTakenDoses[0].takenDate);
            if (firstTaken < oldestDate) oldestDate = firstTaken;
        }
        
        if (allMissedDoses.length > 0) {
            const firstMissed = new Date(allMissedDoses[0].expectedDate);
            if (firstMissed < oldestDate) oldestDate = firstMissed;
        }
        
        oldestDate.setHours(0, 0, 0, 0);
        
        let currentDate = new Date(oldestDate);
        let totalCreated = 0;
        
        while (currentDate < today) {
            const created = await createDailySummaryForDate(currentDate);
            totalCreated += created;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Daily summary backfill complete. Created ${totalCreated} summaries.`);
    } catch (error) {
        console.error('Error backfilling daily summaries:', error);
    }
};

updateExpiredMedicines();
setInterval(updateExpiredMedicines, 24 * 60 * 60 * 1000);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/missed-doses', missedDoseRoutes);
app.use('/api/missed-appointments', missedAppointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/daily-summary', dailySummaryRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'MediTrack API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
    
    await backfillMissedDoses();
    await backfillDailySummaries();
    await autoCheckMissedDoses();
    
    setInterval(autoCheckMissedDoses, 60 * 60 * 1000);
});

const cleanOldTakenDoses = async () => {
    const TakenDose = require('./models/TakenDose');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    await TakenDose.deleteMany({ takenDate: { $lt: sevenDaysAgo } });
    console.log('Cleaned up old taken doses');
};

setInterval(cleanOldTakenDoses, 24 * 60 * 60 * 1000); 

/* const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const appointmentRoutes = require('./routes/appointments');
const symptomRoutes = require('./routes/symptoms');
const interactionRoutes = require('./routes/interactions');
const missedDoseRoutes = require('./routes/missedDoses');
const missedAppointmentRoutes = require('./routes/missedAppointments');
const notificationRoutes = require('./routes/notifications');
const dailySummaryRoutes = require('./routes/dailySummary');
const caregiverRoutes = require('./routes/caregiver');
const updateExpiredMedicines = require('./jobs/updateExpiredMedicines');
const userRoutes = require('./routes/users');

dotenv.config();
connectDB();

updateExpiredMedicines();
setInterval(updateExpiredMedicines, 24 * 60 * 60 * 1000);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/missed-doses', missedDoseRoutes);
app.use('/api/missed-appointments', missedAppointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/daily-summary', dailySummaryRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'MediTrack API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
});

const cleanOldTakenDoses = async () => {
    const TakenDose = require('./models/TakenDose');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    await TakenDose.deleteMany({ takenDate: { $lt: sevenDaysAgo } });
    console.log('Cleaned up old taken doses');
};

setInterval(cleanOldTakenDoses, 24 * 60 * 60 * 1000); */