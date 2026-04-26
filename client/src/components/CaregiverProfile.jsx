import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Alert, Container, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FiUser, FiMail, FiCalendar, FiUsers, FiHeart, FiActivity } from 'react-icons/fi';

const CaregiverProfile = () => {
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setUser(userRes.data.user);
            
            const patientsRes = await axios.get('http://localhost:5000/api/caregiver/patients', {
                headers: { 'x-auth-token': token }
            });
            setPatients(patientsRes.data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'danger', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' },
        subtitle: { fontSize: '14px', color: '#64748B', marginBottom: '24px' },
        card: { border: 'none', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', marginBottom: '24px', overflow: 'hidden' },
        cardHeader: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '18px 24px' },
        cardHeaderTitle: { fontSize: '16px', fontWeight: '600', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
        cardBody: { padding: '24px' },
        infoRow: { display: 'flex', marginBottom: '16px', flexWrap: 'wrap', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' },
        label: { width: '140px', fontWeight: '500', color: '#64748B', fontSize: '14px' },
        value: { flex: 1, color: '#1E293B', fontSize: '14px', fontWeight: '500' },
        patientCard: { backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #E2E8F0' },
        patientName: { fontSize: '18px', fontWeight: '600', color: '#1E293B', marginBottom: '12px' },
        patientDetail: { fontSize: '13px', color: '#64748B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
        allergyBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', marginRight: '8px', marginBottom: '8px' },
        allergyMild: { backgroundColor: '#D1FAE5', color: '#065F46' },
        allergyModerate: { backgroundColor: '#FEF3C7', color: '#92400E' },
        allergySevere: { backgroundColor: '#FEE2E2', color: '#991B1B' },
        viewButton: { backgroundColor: '#0066CC', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8' }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>Loading profile information...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <h1 style={styles.title}>Caregiver Dashboard</h1>
            <p style={styles.subtitle}>Manage and monitor your patients' health</p>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px' }}>{message.text}</Alert>}

            {/* Caregiver Information */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderTitle}>
                        <FiUser size={16} /> Your Information
                    </div>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Name</div>
                        <div style={styles.value}>{user?.name}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Email</div>
                        <div style={styles.value}>{user?.email}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Role</div>
                        <div style={styles.value}>Caregiver</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Member Since</div>
                        <div style={styles.value}>{new Date(user?.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            </Card>

            {/* Patients Section */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderTitle}>
                        <FiUsers size={16} /> Your Patients ({patients.length})
                    </div>
                </div>
                <div style={styles.cardBody}>
                    {patients.length === 0 ? (
                        <div style={styles.emptyState}>
                            No patients linked yet.
                            <br />
                            <span style={{ fontSize: '12px' }}>Ask your patient to add you as a caregiver from their profile.</span>
                        </div>
                    ) : (
                        patients.map(patient => (
                            <div key={patient._id} style={styles.patientCard}>
                                <div style={styles.patientName}>{patient.name}</div>
                                <div style={styles.patientDetail}>
                                    <FiMail size={14} /> {patient.email}
                                </div>
                                <div style={styles.patientDetail}>
                                    <FiCalendar size={14} /> Patient since: {new Date(patient.createdAt).toLocaleDateString()}
                                </div>
                                
                                {patient.allergies && patient.allergies.length > 0 && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <FiHeart size={14} color="#EF4444" />
                                            <span style={{ fontSize: '12px', fontWeight: '500' }}>Allergies:</span>
                                        </div>
                                        <div>
                                            {patient.allergies.map((allergy, idx) => (
                                                <span 
                                                    key={idx} 
                                                    style={{
                                                        ...styles.allergyBadge,
                                                        ...(allergy.severity === 'mild' ? styles.allergyMild : 
                                                           allergy.severity === 'moderate' ? styles.allergyModerate : 
                                                           styles.allergySevere)
                                                    }}
                                                >
                                                    {allergy.allergen} ({allergy.severity})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ marginTop: '16px' }}>
                                    <Link to={`/daily-summary?patient=${patient._id}`} style={styles.viewButton}>
                                        View Health Summary
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default CaregiverProfile;