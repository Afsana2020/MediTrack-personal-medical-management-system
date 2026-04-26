import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Alert, Container, Badge } from 'react-bootstrap';
import axios from 'axios';

const AppointmentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointment();
    }, [id]);

    const fetchAppointment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/appointments/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setAppointment(response.data);
        } catch (err) {
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (window.confirm('Mark this appointment as completed?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:5000/api/appointments/${id}/complete`, {}, {
                    headers: { 'x-auth-token': token }
                });
                fetchAppointment();
            } catch (err) {
                setError('Failed to mark as completed');
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this appointment?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                navigate('/appointments');
            } catch (err) {
                setError('Failed to delete');
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = { scheduled: '#0066CC', completed: '#10B981', cancelled: '#EF4444', missed: '#DC2626' };
        return <span style={{ backgroundColor: variants[status] || '#0066CC', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{status || 'Scheduled'}</span>;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    if (error || !appointment) return <Alert variant="danger">{error || 'Not found'}</Alert>;

    return (
        <Container style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Appointment Details</h1>
                <Link to="/appointments"><Button variant="secondary">Back</Button></Link>
            </div>

            <Card style={{ marginBottom: '20px' }}>
                <Card.Header><strong>Appointment Information</strong></Card.Header>
                <Card.Body>
                    <p><strong>Doctor:</strong> Dr. {appointment.doctorName}</p>
                    <p><strong>Specialty:</strong> {appointment.specialty || 'Not specified'}</p>
                    <p><strong>Hospital:</strong> {appointment.hospitalName || 'Not specified'}</p>
                    <p><strong>Date & Time:</strong> {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
                    <p><strong>Status:</strong> {getStatusBadge(appointment.status)}</p>
                    {appointment.notes && <p><strong>My Notes:</strong> {appointment.notes}</p>}
                </Card.Body>
            </Card>

            {appointment.linkedPrescriptions && appointment.linkedPrescriptions.length > 0 && (
                <Card style={{ marginBottom: '20px' }}>
                    <Card.Header><strong>Linked Prescriptions</strong></Card.Header>
                    <Card.Body>
                        {appointment.linkedPrescriptions.map(p => (
                            <div key={p._id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                                <Link to={`/prescriptions/${p._id}`} style={{ fontWeight: '600', color: '#0066CC' }}>{p.title || 'Untitled'}</Link>
                                <div>Dr. {p.doctorName} | {new Date(p.prescriptionDate).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </Card.Body>
                </Card>
            )}

            {appointment.linkedSymptoms && appointment.linkedSymptoms.length > 0 && (
                <Card style={{ marginBottom: '20px' }}>
                    <Card.Header><strong>Symptoms to Discuss</strong></Card.Header>
                    <Card.Body>
                        {appointment.linkedSymptoms.map(s => (
                            <div key={s._id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                                <Link to={`/symptoms/${s._id}`} style={{ fontWeight: '600', color: '#0066CC' }}>{s.symptom}</Link>
                                <div>Severity: {s.severity} | Started: {new Date(s.date).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </Card.Body>
                </Card>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
                {appointment.status === 'scheduled' && (
                    <Button variant="success" onClick={handleComplete}>Mark as Completed</Button>
                )}
                <Link to={`/edit_appointment/${id}`}><Button variant="primary">Edit</Button></Link>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
        </Container>
    );
};

export default AppointmentView;