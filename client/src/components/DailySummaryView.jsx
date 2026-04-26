import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiFileText, FiUser } from 'react-icons/fi';

const DailySummaryView = () => {
    const [groupedSummaries, setGroupedSummaries] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSummaries();
    }, []);

    const loadSummaries = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const summariesRes = await axios.get('http://localhost:5000/api/daily-summary/patient', {
                headers: { 'x-auth-token': token }
            });
            
            const grouped = {};
            summariesRes.data.forEach(summary => {
                const patientName = summary.patientName || 'Unknown Patient';
                if (!grouped[patientName]) {
                    grouped[patientName] = [];
                }
                grouped[patientName].push(summary);
            });
            
            setGroupedSummaries(grouped);
        } catch (error) {
            console.error('Error loading summaries:', error);
            setMessage({ type: 'danger', text: 'Failed to load summaries' });
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' },
        subtitle: { fontSize: '14px', color: '#64748B' },
        patientCard: { backgroundColor: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', marginBottom: '32px', overflow: 'hidden' },
        patientHeader: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' },
        patientName: { fontSize: '18px', fontWeight: '600', color: '#1E293B', margin: 0 },
        summaryCount: { backgroundColor: '#0066CC', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        summaryCard: { backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '20px 24px' },
        summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
        summaryDate: { fontWeight: '600', color: '#1E293B', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
        summaryBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        summaryText: { backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', color: '#475569' },
        section: { marginBottom: '16px' },
        sectionTitle: { fontWeight: '600', color: '#1E293B', marginBottom: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
        itemList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
        item: { padding: '4px 12px', borderRadius: '16px', fontSize: '12px' },
        goodItem: { backgroundColor: '#D1FAE5', color: '#065F46' },
        badItem: { backgroundColor: '#FEE2E2', color: '#991B1B' },
        neutralItem: { backgroundColor: '#F1F5F9', color: '#1E293B' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8' },
        statsCard: { backgroundColor: '#EFF6FF', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center', border: '1px solid #BFDBFE' },
        statsNumber: { fontSize: '36px', fontWeight: '700', color: '#0066CC' },
        statsLabel: { fontSize: '14px', color: '#475569', marginTop: '4px' }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    }

    const totalSummaries = Object.values(groupedSummaries).flat().length;

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Daily Health Summary</h1>
                <p style={styles.subtitle}>Health updates for all your patients</p>
            </div>

            <div style={styles.statsCard}>
                <div style={styles.statsNumber}>{Object.keys(groupedSummaries).length}</div>
                <div style={styles.statsLabel}>Total Summary records</div>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px' }}>{message.text}</Alert>}

            {totalSummaries === 0 ? (
                <div style={styles.emptyState}>
                    No daily summaries available yet.
                    <br />
                    <span style={{ fontSize: '12px' }}>Summaries will appear once data is available.</span>
                </div>
            ) : (
                Object.entries(groupedSummaries).map(([patientName, summaries]) => (
                    <div key={patientName} style={styles.patientCard}>
                        <div style={styles.patientHeader}>
                            <FiUser size={18} color="#0066CC" />
                            <h3 style={styles.patientName}>{patientName}</h3>
                            <span style={styles.summaryCount}>{summaries.length} reports</span>
                        </div>
                        
                        {summaries.map(summary => (
                            <div key={summary._id} style={styles.summaryCard}>
                                <div style={styles.summaryHeader}>
                                    <div style={styles.summaryDate}>
                                        <FiCalendar size={14} />
                                        {new Date(summary.date).toLocaleDateString()}
                                    </div>
                                    <Badge style={{ 
                                        backgroundColor: summary.medicinesMissed?.length === 0 && summary.appointmentsMissed?.length === 0 ? '#10B981' : '#EF4444',
                                        ...styles.summaryBadge
                                    }}>
                                        {summary.medicinesMissed?.length === 0 && summary.appointmentsMissed?.length === 0 ? 'All Good' : 'Attention Needed'}
                                    </Badge>
                                </div>

                                {summary.summaryText && (
                                    <div style={styles.summaryText}>
                                        {summary.summaryText}
                                    </div>
                                )}

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <FiCheckCircle size={12} color="#10B981" /> Medications Taken
                                    </div>
                                    <div style={styles.itemList}>
                                        {summary.medicinesTaken && summary.medicinesTaken.length > 0 ? (
                                            summary.medicinesTaken.map((med, idx) => (
                                                <span key={idx} style={{ ...styles.item, ...styles.goodItem }}>{med.drugName}</span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>No medications taken</span>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <FiAlertCircle size={12} color="#EF4444" /> Missed Medications
                                    </div>
                                    <div style={styles.itemList}>
                                        {summary.medicinesMissed && summary.medicinesMissed.length > 0 ? (
                                            summary.medicinesMissed.map((med, idx) => (
                                                <span key={idx} style={{ ...styles.item, ...styles.badItem }}>{med.drugName} ({med.timeSlot})</span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>No missed medications</span>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <FiCheckCircle size={12} color="#10B981" /> Completed Appointments
                                    </div>
                                    <div style={styles.itemList}>
                                        {summary.appointmentsCompleted && summary.appointmentsCompleted.length > 0 ? (
                                            summary.appointmentsCompleted.map((apt, idx) => (
                                                <span key={idx} style={{ ...styles.item, ...styles.goodItem }}>Dr. {apt.doctorName}</span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>No appointments completed</span>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>
                                        <FiAlertCircle size={12} color="#EF4444" /> Missed Appointments
                                    </div>
                                    <div style={styles.itemList}>
                                        {summary.appointmentsMissed && summary.appointmentsMissed.length > 0 ? (
                                            summary.appointmentsMissed.map((apt, idx) => (
                                                <span key={idx} style={{ ...styles.item, ...styles.badItem }}>Dr. {apt.doctorName}</span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>No missed appointments</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </Container>
    );
};

export default DailySummaryView;