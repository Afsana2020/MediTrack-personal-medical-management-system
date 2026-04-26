import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const SymptomEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [appointments, setAppointments] = useState([]);
    
    const [formData, setFormData] = useState({
        symptom: '',
        severity: 'mild',
        duration: '',
        date: '',
        time: '',
        notes: '',
        appointmentId: '',
        appointmentTitle: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const symRes = await axios.get(`http://localhost:5000/api/symptoms/${id}`, {
                headers: { 'x-auth-token': token }
            });
            
            const aptRes = await axios.get('http://localhost:5000/api/appointments', {
                headers: { 'x-auth-token': token }
            });
            
            const symptom = symRes.data;
            setFormData({
                symptom: symptom.symptom || '',
                severity: symptom.severity || 'mild',
                duration: symptom.duration || '',
                date: symptom.date ? symptom.date.split('T')[0] : '',
                time: symptom.time || '',
                notes: symptom.notes || '',
                appointmentId: symptom.appointmentId || '',
                appointmentTitle: symptom.appointmentTitle || ''
            });
            
            setAppointments(aptRes.data);
        } catch (err) {
            setError('Failed to load symptom data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAppointmentSelect = (e) => {
        const appointmentId = e.target.value;
        const appointment = appointments.find(a => a._id === appointmentId);
        setFormData({
            ...formData,
            appointmentId: appointmentId,
            appointmentTitle: appointment ? `Dr. ${appointment.doctorName} on ${new Date(appointment.date).toLocaleDateString()}` : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/symptoms/${id}`, formData, {
                headers: { 'x-auth-token': token }
            });
            navigate(`/symptoms/${id}`);
        } catch (err) {
            setError('Failed to update symptom');
        } finally {
            setSaving(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '700px',
            margin: '0 auto',
            padding: '24px'
        },
        header: {
            marginBottom: '28px'
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
        label: {
            fontWeight: '500',
            fontSize: '13px',
            color: '#334155',
            marginBottom: '6px',
            display: 'block'
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF'
        },
        textarea: {
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            resize: 'vertical'
        },
        select: {
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
        },
        saveButton: {
            backgroundColor: '#0066CC',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
        },
        cancelButton: {
            backgroundColor: '#F1F5F9',
            color: '#475569',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
        }
    };

    if (loading) {
        return (
            <Container fluid style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
            </Container>
        );
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Edit Symptom</h1>
            </div>

            <Form onSubmit={handleSubmit}>
                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Symptom Details</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.label}>Symptom</Form.Label>
                            <Form.Control
                                type="text"
                                name="symptom"
                                value={formData.symptom}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Headache, Nausea, Fatigue"
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Severity</Form.Label>
                                    <Form.Select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        <option value="mild">Mild</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="severe">Severe</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Duration</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="e.g., 2 days, 1 week"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Time (Optional)</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label style={styles.label}>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                style={styles.textarea}
                                rows="3"
                                placeholder="Additional details about the symptom"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={styles.label}>Link to Appointment (Optional)</Form.Label>
                            <Form.Select
                                value={formData.appointmentId}
                                onChange={handleAppointmentSelect}
                                style={styles.select}
                            >
                                <option value="">None</option>
                                {appointments.map(a => (
                                    <option key={a._id} value={a._id}>
                                        Dr. {a.doctorName} - {new Date(a.date).toLocaleDateString()} ({a.status})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </Card>

                {error && <Alert variant="danger">{error}</Alert>}

                <div style={styles.buttonGroup}>
                    <Button type="submit" variant="primary" disabled={saving} style={styles.saveButton}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/symptoms/${id}`)} style={styles.cancelButton}>
                        Cancel
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default SymptomEdit;