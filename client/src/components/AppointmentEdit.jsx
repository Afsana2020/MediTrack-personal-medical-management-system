import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import axios from 'axios';
import { getPrescriptions } from '../services/api';

const AppointmentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
    const [formData, setFormData] = useState({
        doctorName: '',
        specialty: '',
        hospitalName: '',
        date: '',
        time: '',
        notes: '',
        status: 'scheduled'
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const aptRes = await axios.get(`http://localhost:5000/api/appointments/${id}`, { headers: { 'x-auth-token': token } });
            const presRes = await getPrescriptions();
            
            const apt = aptRes.data;
            setFormData({
                doctorName: apt.doctorName || '',
                specialty: apt.specialty || '',
                hospitalName: apt.hospitalName || '',
                date: apt.date ? apt.date.split('T')[0] : '',
                time: apt.time || '',
                notes: apt.notes || '',
                status: apt.status || 'scheduled'
            });
            setPrescriptions(presRes.data.filter(p => p.isActive));
            setSelectedPrescriptions(apt.prescriptionIds || []);
        } catch (err) {
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handlePrescriptionToggle = (prescriptionId) => {
        if (selectedPrescriptions.includes(prescriptionId)) {
            setSelectedPrescriptions(selectedPrescriptions.filter(id => id !== prescriptionId));
        } else {
            setSelectedPrescriptions([...selectedPrescriptions, prescriptionId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const prescriptionTitles = selectedPrescriptions.map(presId => {
                const pres = prescriptions.find(p => p._id === presId);
                return pres ? `${pres.title || 'Untitled'} - Dr. ${pres.doctorName}` : '';
            });
            
            await axios.put(`http://localhost:5000/api/appointments/${id}`, { ...formData, prescriptionIds: selectedPrescriptions, prescriptionTitles }, { headers: { 'x-auth-token': token } });
            navigate(`/appointments/${id}`);
        } catch (err) {
            setError('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

    return (
        <Container style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '24px' }}>Edit Appointment</h1>
            <Form onSubmit={handleSubmit}>
                <Card style={{ marginBottom: '20px' }}>
                    <Card.Body>
                        <Form.Group className="mb-3"><Form.Label>Doctor Name</Form.Label><Form.Control required value={formData.doctorName} onChange={(e) => setFormData({...formData, doctorName: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Specialty</Form.Label><Form.Control value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Hospital</Form.Label><Form.Control value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Date</Form.Label><Form.Control type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Time</Form.Label><Form.Control type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </Form.Select></Form.Group>
                        
                        <Form.Label>Linked Prescriptions</Form.Label>
                        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                            {prescriptions.map(p => (
                                <Form.Check key={p._id} type="checkbox" label={`${p.title || 'Untitled'} - Dr. ${p.doctorName}`} checked={selectedPrescriptions.includes(p._id)} onChange={() => handlePrescriptionToggle(p._id)} />
                            ))}
                        </div>
                        
                        <Form.Group className="mt-3"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></Form.Group>
                    </Card.Body>
                </Card>
                {error && <Alert variant="danger">{error}</Alert>}
                <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </Form>
        </Container>
    );
};

export default AppointmentEdit;