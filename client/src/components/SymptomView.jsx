import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Alert, Container, Badge } from 'react-bootstrap';
import axios from 'axios';

const SymptomView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [symptom, setSymptom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSymptom();
    }, [id]);

    const fetchSymptom = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/symptoms/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setSymptom(response.data);
        } catch (err) {
            setError('Failed to load symptom details');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity) => {
        const variants = {
            mild: { bg: '#10B981', label: 'Mild' },
            moderate: { bg: '#F59E0B', label: 'Moderate' },
            severe: { bg: '#EF4444', label: 'Severe' }
        };
        const variant = variants[severity] || variants.mild;
        return (
            <span style={{
                backgroundColor: variant.bg,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
            }}>
                {variant.label}
            </span>
        );
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '600',
            color: '#1E293B',
            margin: 0
        },
        card: {
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px',
            overflow: 'hidden'
        },
        cardHeader: {
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 24px'
        },
        cardHeaderTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1E293B',
            margin: 0
        },
        cardBody: {
            padding: '24px'
        },
        infoRow: {
            display: 'flex',
            marginBottom: '16px',
            flexWrap: 'wrap'
        },
        label: {
            width: '120px',
            fontWeight: '500',
            color: '#64748B',
            fontSize: '14px'
        },
        value: {
            flex: 1,
            color: '#1E293B',
            fontSize: '14px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
        },
        editButton: {
            backgroundColor: '#0066CC',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
        },
        deleteButton: {
            backgroundColor: '#EF4444',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
        },
        backButton: {
            backgroundColor: '#F1F5F9',
            color: '#475569',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
        },
        appointmentLink: {
            backgroundColor: '#EFF6FF',
            padding: '12px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            display: 'block',
            marginTop: '16px'
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this symptom entry?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/symptoms/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                navigate('/symptoms');
            } catch (err) {
                setError('Failed to delete symptom');
            }
        }
    };

    if (loading) {
        return (
            <Container fluid style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
            </Container>
        );
    }

    if (error || !symptom) {
        return (
            <Container fluid style={styles.container}>
                <Alert variant="danger">{error || 'Symptom not found'}</Alert>
                <Link to="/symptoms">
                    <Button style={styles.backButton}>Back to Symptoms</Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Symptom Details</h1>
                <div>
                    <Link to="/symptoms">
                        <Button style={styles.backButton}>Back</Button>
                    </Link>
                </div>
            </div>

            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}>Symptom Information</h5>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Symptom:</div>
                        <div style={styles.value}>{symptom.symptom}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Severity:</div>
                        <div style={styles.value}>{getSeverityBadge(symptom.severity)}</div>
                    </div>
                    {symptom.duration && (
                        <div style={styles.infoRow}>
                            <div style={styles.label}>Duration:</div>
                            <div style={styles.value}>{symptom.duration}</div>
                        </div>
                    )}
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Date & Time:</div>
                        <div style={styles.value}>
                            {new Date(symptom.date).toLocaleDateString()} {symptom.time && `at ${symptom.time}`}
                        </div>
                    </div>
                    {symptom.notes && (
                        <div style={styles.infoRow}>
                            <div style={styles.label}>Notes:</div>
                            <div style={styles.value}>{symptom.notes}</div>
                        </div>
                    )}
                    
                    {symptom.appointmentId && (
                        <Link to={`/appointments/${symptom.appointmentId}`} style={styles.appointmentLink}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Linked to Appointment</div>
                            <div style={{ fontSize: '13px', color: '#0066CC' }}>
                                {symptom.appointmentTitle || 'View appointment details →'}
                            </div>
                        </Link>
                    )}
                </div>
            </Card>

            <div style={styles.buttonGroup}>
                <Link to={`/edit_symptom/${id}`}>
                    <Button style={styles.editButton}>Edit Symptom</Button>
                </Link>
                <Button style={styles.deleteButton} onClick={handleDelete}>Delete Symptom</Button>
            </div>
        </Container>
    );
};

export default SymptomView;