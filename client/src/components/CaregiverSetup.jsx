import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FiUserPlus, FiMail, FiUsers, FiTrash2, FiSend } from 'react-icons/fi';

const CaregiverSetup = () => {
    const [patientInfo, setPatientInfo] = useState(null);
    const [caregiverEmail, setCaregiverEmail] = useState('');
    const [caregiverName, setCaregiverName] = useState('');
    const [linkedCaregivers, setLinkedCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [generatingSummary, setGeneratingSummary] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setPatientInfo(userRes.data.user);
            
            const caregiverRes = await axios.get('http://localhost:5000/api/caregiver/links', {
                headers: { 'x-auth-token': token }
            });
            setLinkedCaregivers(caregiverRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkCaregiver = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/caregiver/link', {
                caregiverEmail,
                caregiverName
            }, {
                headers: { 'x-auth-token': token }
            });
            setMessage({ type: 'success', text: 'Caregiver linked successfully' });
            setCaregiverEmail('');
            setCaregiverName('');
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to link caregiver' });
        }
    };

    const handleRemoveCaregiver = async (caregiverId) => {
        if (window.confirm('Remove this caregiver?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/caregiver/links/${caregiverId}`, {
                    headers: { 'x-auth-token': token }
                });
                loadData();
                setMessage({ type: 'success', text: 'Caregiver removed' });
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Failed to remove caregiver' });
            }
        }
    };

    const generateDailySummary = async () => {
        setGeneratingSummary(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/daily-summary/generate', {}, {
                headers: { 'x-auth-token': token }
            });
            setMessage({ type: 'success', text: 'Daily summary sent to caregivers' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to generate summary' });
        } finally {
            setGeneratingSummary(false);
        }
    };

    const styles = {
        container: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' },
        subtitle: { fontSize: '14px', color: '#64748B' },
        card: { border: 'none', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', marginBottom: '24px' },
        cardHeader: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '16px 20px', fontWeight: '600' },
        cardBody: { padding: '20px' },
        infoRow: { display: 'flex', marginBottom: '12px' },
        label: { width: '120px', fontWeight: '500', color: '#64748B' },
        value: { flex: 1, color: '#1E293B', fontWeight: '500' },
        caregiverItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '12px' },
        caregiverInfo: { flex: 1 },
        caregiverName: { fontWeight: '600', color: '#1E293B' },
        caregiverEmail: { fontSize: '12px', color: '#64748B', marginTop: '4px' },
        removeButton: { backgroundColor: '#EF4444', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', color: 'white' },
        input: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px' },
        button: { backgroundColor: '#0066CC', border: 'none', padding: '10px 24px', borderRadius: '10px', color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
        summaryButton: { backgroundColor: '#10B981', border: 'none', padding: '10px 24px', borderRadius: '10px', color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' },
        emptyState: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Caregiver Management</h1>
                <p style={styles.subtitle}>Manage who can receive your health updates</p>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px' }}>{message.text}</Alert>}

            {/* Patient Info */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>Your Information</div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Name:</div>
                        <div style={styles.value}>{patientInfo?.name}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Email:</div>
                        <div style={styles.value}>{patientInfo?.email}</div>
                    </div>
                </div>
            </Card>

            {/* Add Caregiver */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>Add Caregiver</div>
                <div style={styles.cardBody}>
                    <Form onSubmit={handleLinkCaregiver}>
                        <Form.Group className="mb-3">
                            <Form.Label>Caregiver Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={caregiverName} 
                                onChange={(e) => setCaregiverName(e.target.value)} 
                                placeholder="e.g., John Smith"
                                required
                                style={styles.input}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Caregiver Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={caregiverEmail} 
                                onChange={(e) => setCaregiverEmail(e.target.value)} 
                                placeholder="caregiver@example.com"
                                required
                                style={styles.input}
                            />
                            <Form.Text className="text-muted">Daily summaries will be sent to this email</Form.Text>
                        </Form.Group>
                        <Button type="submit" style={styles.button}>
                            <FiUserPlus size={16} /> Add Caregiver
                        </Button>
                    </Form>
                </div>
            </Card>

            {/* Linked Caregivers */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <FiUsers size={16} style={{ marginRight: '8px' }} /> Linked Caregivers
                </div>
                <div style={styles.cardBody}>
                    {linkedCaregivers.length === 0 ? (
                        <div style={styles.emptyState}>
                            No caregivers linked yet
                        </div>
                    ) : (
                        linkedCaregivers.map(cg => (
                            <div key={cg._id} style={styles.caregiverItem}>
                                <div style={styles.caregiverInfo}>
                                    <div style={styles.caregiverName}>{cg.caregiverName}</div>
                                    <div style={styles.caregiverEmail}>{cg.caregiverEmail}</div>
                                </div>
                                <Button size="sm" style={styles.removeButton} onClick={() => handleRemoveCaregiver(cg._id)}>
                                    <FiTrash2 size={12} /> Remove
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Send Daily Summary */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>Send Daily Summary</div>
                <div style={styles.cardBody}>
                    <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
                        Send today's health summary to all linked caregivers. This includes medications taken, missed doses, and appointments.
                    </p>
                    <Button onClick={generateDailySummary} disabled={generatingSummary || linkedCaregivers.length === 0} style={styles.summaryButton}>
                        <FiSend size={16} /> {generatingSummary ? 'Sending...' : 'Send Daily Summary'}
                    </Button>
                    {linkedCaregivers.length === 0 && (
                        <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Add a caregiver first to send summaries</p>
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default CaregiverSetup;