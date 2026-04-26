import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, checkInteractions } from '../services/api';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import { FiBell, FiCalendar, FiAlertCircle, FiPlus } from 'react-icons/fi';

const Dashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [missedDoses, setMissedDoses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [takeMessage, setTakeMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);
const loadData = async () => {
    try {
        const token = localStorage.getItem('token');
        
  
        await axios.post('http://localhost:5000/api/missed-doses/update-status', {}, {
            headers: { 'x-auth-token': token }
        });
        
       
        await axios.post('http://localhost:5000/api/missed-doses/force-check', {}, {
            headers: { 'x-auth-token': token }
        });

        await axios.post('http://localhost:5000/api/missed-doses/sync-missed', {}, {
            headers: { 'x-auth-token': token }
        });
        
        const hour = new Date().getHours();
        let slot = 'morning';
        if (hour >= 12 && hour < 17) slot = 'afternoon';
        else if (hour >= 17 && hour < 21) slot = 'evening';
        else if (hour >= 21 || hour < 6) slot = 'night';
        
        const medRes = await axios.get(`http://localhost:5000/api/medicines/timeslot/${slot}`, {
            headers: { 'x-auth-token': token }
        });
        setMedicines(medRes.data);
        
        const appRes = await getAppointments();
        setAppointments(appRes.data);
        
        const intRes = await checkInteractions();
        setInteractions(intRes.data.interactions || []);
        
        const missedRes = await axios.get('http://localhost:5000/api/missed-doses', {
            headers: { 'x-auth-token': token }
        });
        setMissedDoses(missedRes.data);
        
        const notifRes = await axios.get('http://localhost:5000/api/notifications/unread-count', {
            headers: { 'x-auth-token': token }
        });
        setNotifications(notifRes.data);
        
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        setLoading(false);
    }
};

    const getCurrentTimeSlot = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    };

    const currentTimeSlot = getCurrentTimeSlot();

    const getTimeSlotName = () => {
        const slots = {
            morning: 'Morning (6:00 AM - 12:00 PM)',
            afternoon: 'Afternoon (12:00 PM - 5:00 PM)',
            evening: 'Evening (5:00 PM - 9:00 PM)',
            night: 'Night (9:00 PM - 6:00 AM)'
        };
        return slots[currentTimeSlot];
    };

    const getDoseCount = (medicine) => {
        if (currentTimeSlot === 'morning') return medicine.morning;
        if (currentTimeSlot === 'afternoon') return medicine.afternoon;
        if (currentTimeSlot === 'evening') return medicine.evening;
        return medicine.night;
    };

    const markDoseAsTaken = async (medicineId, drugName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/missed-doses/take`, {
                medicineId,
                timeSlot: currentTimeSlot,
                drugName
            }, { headers: { 'x-auth-token': token } });
            
            setTakeMessage(`${drugName} marked as taken`);
            setTimeout(() => setTakeMessage(''), 3000);
            window.location.reload();
        } catch (error) {
            console.error('Error marking dose:', error);
            setTakeMessage(`Failed to mark ${drugName}`);
            setTimeout(() => setTakeMessage(''), 3000);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getNextAppointment = () => {
        const now = new Date();
        const futureAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= now && apt.status === 'scheduled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        return futureAppointments[0] || null;
    };

    const markAppointmentAsCompleted = async (appointmentId, doctorName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/appointments/${appointmentId}/complete`, {}, {
                headers: { 'x-auth-token': token }
            });
            setTakeMessage(`Appointment with Dr. ${doctorName} marked as completed`);
            setTimeout(() => setTakeMessage(''), 3000);
            window.location.reload();
        } catch (error) {
            console.error('Error completing appointment:', error);
            setTakeMessage(`Failed to mark appointment`);
            setTimeout(() => setTakeMessage(''), 3000);
        }
    };

    const nextAppointment = getNextAppointment();

    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'Inter, sans-serif' },
        welcomeSection: { marginBottom: '24px' },
        greeting: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' },
        subGreeting: { fontSize: '14px', color: '#64748B' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' },
        statCard: { backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', textAlign: 'center' },
        statLabel: { fontSize: '13px', fontWeight: '500', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
        statValue: { fontSize: '32px', fontWeight: '700', color: '#0066CC' },
        statUnit: { fontSize: '14px', fontWeight: '400', color: '#94A3B8', marginLeft: '4px' },
        reminderCard: { backgroundColor: '#EFF6FF', borderRadius: '20px', padding: '20px', marginBottom: '28px', border: '1px solid #BFDBFE' },
        reminderTitle: { fontSize: '16px', fontWeight: '600', color: '#1E3A8A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
        medicationReminderItem: { backgroundColor: 'white', borderRadius: '12px', padding: '12px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
        reminderDrugName: { fontWeight: '600', color: '#1E293B', fontSize: '15px' },
        reminderDose: { fontSize: '13px', color: '#0066CC', fontWeight: '500' },
        takeButton: { backgroundColor: '#10B981', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer' },
        messageBox: { backgroundColor: '#D1FAE5', color: '#065F46', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
        nextAppointmentCard: { backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '28px', border: '1px solid #E2E8F0' },
        appointmentHeader: { fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
        appointmentDetail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
        appointmentDoctor: { fontSize: '18px', fontWeight: '600', color: '#0066CC' },
        appointmentDateTime: { fontSize: '14px', color: '#64748B' },
        completeButton: { backgroundColor: '#10B981', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', color: 'white', cursor: 'pointer' },
        viewButton: { backgroundColor: '#0066CC', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', color: 'white', cursor: 'pointer' },
        missedAlertCard: { backgroundColor: '#FEF2F2', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', border: '1px solid #FEE2E2' },
        missedAlertTitle: { fontSize: '14px', fontWeight: '600', color: '#991B1B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        missedItem: { backgroundColor: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
        interactionCard: { backgroundColor: '#FEF2F2', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', border: '1px solid #FEE2E2' },
        interactionTitle: { fontSize: '14px', fontWeight: '600', color: '#991B1B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        interactionItem: { backgroundColor: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', border: '1px solid #FEE2E2', fontSize: '13px' },
        actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' },
        actionCard: { borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.25s ease, box-shadow 0.25s ease' },
        actionImage: { width: '100%', height: '140px', objectFit: 'cover', display: 'block' },
        actionTitle: { padding: '12px 16px', textAlign: 'center', fontSize: '15px', fontWeight: '700', color: '#1E293B', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' },
        emptyState: { textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' },
        notifIcon: { color: '#64748B' }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>Loading...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.welcomeSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={styles.greeting}>Welcome back</h1>
                        <p style={styles.subGreeting}>Here is your health summary for today</p>
                    </div>
                    <Link to="/notifications" style={{ color: '#0066CC', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiBell size={20} />
                        {notifications.count > 0 && <span style={{ backgroundColor: '#EF4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px' }}>{notifications.count}</span>}
                    </Link>
                </div>
            </div>

            {takeMessage && <div style={styles.messageBox}>{takeMessage}</div>}

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Medications</div>
                    <div><span style={styles.statValue}>{medicines.length}</span><span style={styles.statUnit}>for current Slot</span></div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Upcoming Appointments</div>
                    <div><span style={styles.statValue}>{appointments.filter(a => a.status === 'scheduled').length}</span><span style={styles.statUnit}>total</span></div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Interactions</div>
                    <div><span style={styles.statValue}>{interactions.length}</span><span style={styles.statUnit}>warnings</span></div>
                </div>
            </div>

            {missedDoses.length > 0 && (
                <div style={styles.missedAlertCard}>
                    <div style={styles.missedAlertTitle}><FiAlertCircle size={14} /> Missed Doses</div>
                    {missedDoses.slice(0, 3).map((dose, idx) => (
                        <div key={idx} style={styles.missedItem}>
                            <div><strong>{dose.drugName}</strong><div style={{ fontSize: '11px', color: '#64748B' }}>Missed {dose.timeSlot} dose</div></div>
                            <Link to="/missed-doses"><button style={{ backgroundColor: '#0066CC', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', color: 'white' }}>View</button></Link>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.reminderCard}>
                <div style={styles.reminderTitle}>Medications to Take - {getTimeSlotName()}</div>
                {medicines.length === 0 ? (
                    <div style={styles.emptyState}>No medicines scheduled for this time</div>
                ) : (
                    medicines.map((med, idx) => (
                        <div key={idx} style={styles.medicationReminderItem}>
                            <div>
                                <div style={styles.reminderDrugName}>{med.drugName} {med.strength && `- ${med.strength}`}</div>
                                {med.specialInstructions && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{med.specialInstructions}</div>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={styles.reminderDose}>Take {getDoseCount(med)} {getDoseCount(med) === 1 ? 'tablet' : 'tablets'}</div>
                                <button style={styles.takeButton} onClick={() => markDoseAsTaken(med._id, med.drugName)}>Take</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={styles.nextAppointmentCard}>
                <div style={styles.appointmentHeader}><FiCalendar size={16} /> Next Appointment</div>
                {nextAppointment ? (
                    <div style={styles.appointmentDetail}>
                        <div>
                            <div style={styles.appointmentDoctor}>Dr. {nextAppointment.doctorName}</div>
                            {nextAppointment.specialty && <div style={styles.appointmentSpecialty}>{nextAppointment.specialty}</div>}
                        </div>
                        <div style={styles.appointmentDateTime}>
                            {new Date(nextAppointment.date).toLocaleDateString()} at {formatTime(nextAppointment.time)}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button style={styles.completeButton} onClick={() => markAppointmentAsCompleted(nextAppointment._id, nextAppointment.doctorName)}>
                                Mark as Completed
                            </button>
                            <Link to={`/appointments/${nextAppointment._id}`}>
                                <button style={styles.viewButton}>View Details</button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div style={styles.emptyState}>No upcoming appointments</div>
                )}
            </div>

            {interactions.length > 0 && (
                <div style={styles.interactionCard}>
                    <div style={styles.interactionTitle}><FiAlertCircle size={14} /> Drug Interactions Detected</div>
                    {interactions.slice(0, 2).map((int, idx) => (
                        <div key={idx} style={styles.interactionItem}><strong>{int.drug1}</strong> + <strong>{int.drug2}</strong><div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{int.warning}</div></div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <div style={styles.appointmentHeader}>Quick Actions</div>
                <div style={styles.actionsGrid}>
                    <Link to="/add_prescription" style={styles.actionCard}>
                        <img src="/images/actions/add-prescription.jpg" alt="Add Prescription" style={styles.actionImage} />
                        <div style={styles.actionTitle}>Add Prescription</div>
                    </Link>
                    <Link to="/appointments" style={styles.actionCard}>
                        <img src="/images/actions/schedule-appointment.jpg" alt="Schedule Appointment" style={styles.actionImage} />
                        <div style={styles.actionTitle}>Schedule Appointment</div>
                    </Link>
                    <Link to="/symptoms" style={styles.actionCard}>
                        <img src="/images/actions/log-symptom.jpg" alt="Log Symptom" style={styles.actionImage} />
                        <div style={styles.actionTitle}>Log Symptom</div>
                    </Link>
                </div>
            </div>
        </Container>
    );
};

export default Dashboard;