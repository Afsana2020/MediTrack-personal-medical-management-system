import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FiUsers, FiFileText, FiChevronRight, FiXCircle } from 'react-icons/fi';

const CaregiverDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [latestSummary, setLatestSummary] = useState(null);
    const [totalReports, setTotalReports] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const patientsRes = await axios.get('http://localhost:5000/api/caregiver/patients', {
                headers: { 'x-auth-token': token }
            });
            setPatients(patientsRes.data);
            
            const summaryRes = await axios.get('http://localhost:5000/api/daily-summary/patient', {
                headers: { 'x-auth-token': token }
            });
            setTotalReports(summaryRes.data.length);
            if (summaryRes.data.length > 0) {
                setLatestSummary(summaryRes.data[0]);
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'danger', text: 'Failed to load dashboard' });
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0px 24px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: '#F8FAFC',
            minHeight: '50vh'
        },
        header: {
            marginBottom: '24px'
        },
        greeting: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '4px'
        },
        subGreeting: {
            fontSize: '14px',
            color: '#64748B'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px'
        },
        statCard: {
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0'
        },
        statLabel: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#64748B',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        statValue: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#0066CC'
        },
        statIcon: {
            float: 'right',
            color: '#CBD5E1',
            marginTop: '-8px'
        },
        card: {
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            background: 'white',
            marginBottom: '0'
        },
        cardHeader: {
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        cardTitle: {
            fontSize: '15px',
            fontWeight: '600',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        viewAllLink: {
            fontSize: '12px',
            color: '#0066CC',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        cardBody: {
            padding: '16px 20px'
        },
        summaryCard: {
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '16px'
        },
        summaryRow: {
            display: 'flex',
            marginBottom: '12px',
            alignItems: 'flex-start'
        },
        summaryLabel: {
            width: '120px',
            fontWeight: '600',
            color: '#475569',
            fontSize: '13px'
        },
        summaryValue: {
            flex: 1,
            color: '#1E293B',
            fontSize: '13px',
            fontWeight: '500'
        },
        statusBadge: {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500'
        },
        statusGood: {
            backgroundColor: '#D1FAE5',
            color: '#065F46'
        },
        statusBad: {
            backgroundColor: '#FEE2E2',
            color: '#991B1B'
        },
        missedItem: {
            backgroundColor: '#FEF2F2',
            padding: '6px 10px',
            borderRadius: '6px',
            marginBottom: '6px',
            fontSize: '12px',
            color: '#991B1B'
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#94A3B8'
        },
        emptyIcon: {
            marginBottom: '8px',
            color: '#CBD5E1'
        },
        divider: {
            height: '1px',
            backgroundColor: '#E2E8F0',
            margin: '12px 0'
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div style={{ color: '#94A3B8' }}>Loading dashboard...</div>
            </div>
        );
    }

    const totalPatients = patients.length;
    const hasIssues = latestSummary && (latestSummary.medicinesMissed?.length > 0 || latestSummary.appointmentsMissed?.length > 0);
    const missedMeds = latestSummary?.medicinesMissed || [];
    const missedAppts = latestSummary?.appointmentsMissed || [];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.greeting}>Caregiver Dashboard</h1>
                <p style={styles.subGreeting}>Monitor and manage your patients' health journey</p>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px', marginBottom: '20px', padding: '8px 12px', fontSize: '13px' }}>{message.text}</Alert>}

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><FiUsers size={28} /></div>
                    <div style={styles.statLabel}>Total Patients</div>
                    <div style={styles.statValue}>{totalPatients}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><FiFileText size={28} /></div>
                    <div style={styles.statLabel}>Total Reports</div>
                    <div style={styles.statValue}>{totalReports}</div>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>
                        <FiFileText size={16} color="#0066CC" />
                        Latest Daily Summary
                    </div>
                    <Link to="/daily-summary" style={styles.viewAllLink}>
                        View all <FiChevronRight size={12} />
                    </Link>
                </div>
                <div style={styles.cardBody}>
                    {!latestSummary ? (
                        <div style={styles.emptyState}>
                            <FiFileText size={32} style={styles.emptyIcon} />
                            <p style={{ fontSize: '13px' }}>No summaries available</p>
                        </div>
                    ) : (
                        <div style={styles.summaryCard}>
                            <div style={styles.summaryRow}>
                                <div style={styles.summaryLabel}>Patient Name:</div>
                                <div style={styles.summaryValue}>{latestSummary.patientName || 'Unknown'}</div>
                            </div>
                            <div style={styles.summaryRow}>
                                <div style={styles.summaryLabel}>Date:</div>
                                <div style={styles.summaryValue}>
                                    {new Date(latestSummary.date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </div>
                            <div style={styles.summaryRow}>
                                <div style={styles.summaryLabel}>Summary:</div>
                                <div style={styles.summaryValue}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        ...(hasIssues ? styles.statusBad : styles.statusGood)
                                    }}>
                                        {hasIssues ? 'Needs Attention' : 'All Good'}
                                    </span>
                                </div>
                            </div>
                            
                            {missedMeds.length > 0 && (
                                <>
                                    <div style={styles.divider} />
                                    <div style={styles.summaryRow}>
                                        <div style={styles.summaryLabel}>Missed Doses:</div>
                                        <div style={styles.summaryValue}>
                                            {missedMeds.map((med, idx) => (
                                                <div key={idx} style={styles.missedItem}>
                                                    {med.drugName} ({med.timeSlot})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {missedAppts.length > 0 && (
                                <>
                                    <div style={styles.divider} />
                                    <div style={styles.summaryRow}>
                                        <div style={styles.summaryLabel}>Missed Appointments:</div>
                                        <div style={styles.summaryValue}>
                                            {missedAppts.map((apt, idx) => (
                                                <div key={idx} style={styles.missedItem}>
                                                    Dr. {apt.doctorName}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaregiverDashboard;