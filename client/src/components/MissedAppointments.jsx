import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';

const MissedAppointments = () => {
    const [missedAppointments, setMissedAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadMissedAppointments();
    }, []);

    const loadMissedAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/missed-appointments', {
                headers: { 'x-auth-token': token }
            });
            
            const grouped = {};
            response.data.forEach(apt => {
                const key = `${apt.appointmentId}`;
                if (!grouped[key]) {
                    grouped[key] = apt;
                }
            });
            
            setMissedAppointments(Object.values(grouped));
        } catch (error) {
            console.error('Error loading missed appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmAttended = async (id, doctorName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/missed-appointments/${id}/resolve`, {}, {
                headers: { 'x-auth-token': token }
            });
            await loadMissedAppointments();
            setMessage({ type: 'success', text: `Appointment with Dr. ${doctorName} marked as attended` });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'danger', text: 'Failed to update' });
            setTimeout(() => setMessage(''), 3000);
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

    const styles = {
        container: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
        header: { marginBottom: '28px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' },
        subtitle: { fontSize: '14px', color: '#64748B' },
        statsCard: { backgroundColor: '#FEF2F2', borderRadius: '20px', padding: '24px', marginBottom: '28px', textAlign: 'center', border: '1px solid #FEE2E2' },
        statsNumber: { fontSize: '48px', fontWeight: '700', color: '#DC2626' },
        statsLabel: { fontSize: '14px', color: '#475569', marginTop: '8px' },
        missedCard: { border: 'none', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '20px', backgroundColor: '#FFFFFF' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
        doctorName: { fontSize: '20px', fontWeight: '600', color: '#1E293B' },
        missedDate: { fontSize: '13px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' },
        infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', marginTop: '8px' },
        timeSlotBadge: { backgroundColor: '#FEE2E2', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
        confirmButton: { backgroundColor: '#10B981', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', width: '100%', justifyContent: 'center' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '14px' }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Missed Appointments</h1>
                <p style={styles.subtitle}>Appointments that were not marked as completed</p>
            </div>

            <div style={styles.statsCard}>
                <div style={styles.statsNumber}>{missedAppointments.length}</div>
                <div style={styles.statsLabel}>Missed Appointments</div>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px' }}>{message.text}</Alert>}

            {missedAppointments.length === 0 ? (
                <Card style={styles.emptyState}>
                    <div>No missed appointments</div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>Good job keeping your appointments</div>
                </Card>
            ) : (
                missedAppointments.map(apt => {
                    const appointment = apt.appointmentId || {};
                    return (
                        <Card key={apt._id} style={styles.missedCard}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <div style={styles.doctorName}>Dr. {apt.doctorName}</div>
                                    {appointment.specialty && (
                                        <div style={styles.infoRow}>
                                            <FiUser size={14} />
                                            <span>{appointment.specialty}</span>
                                        </div>
                                    )}
                                    <div style={styles.missedDate}>
                                        <FiCalendar size={14} /> 
                                        {new Date(apt.scheduledDate).toLocaleDateString()} at {formatTime(apt.scheduledTime)}
                                    </div>
                                    {appointment.hospitalName && (
                                        <div style={styles.infoRow}>
                                            <FiMapPin size={14} />
                                            <span>{appointment.hospitalName}</span>
                                        </div>
                                    )}
                                    {appointment.notes && (
                                        <div style={styles.infoRow}>
                                            <FiClock size={14} />
                                            <span>Notes: {appointment.notes}</span>
                                        </div>
                                    )}
                                </div>
                                <Badge style={styles.timeSlotBadge}>Missed</Badge>
                            </div>
                            
                            <button style={styles.confirmButton} onClick={() => confirmAttended(apt._id, apt.doctorName)}>
                                <FiCheckCircle size={18} /> I Actually Attended This Appointment
                            </button>
                        </Card>
                    );
                })
            )}
        </Container>
    );
};

export default MissedAppointments;