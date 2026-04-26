import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, getPrescriptions } from '../services/api';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const AppointmentManager = () => {
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [symptoms, setSymptoms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [formData, setFormData] = useState({
        doctorName: '',
        specialty: '',
        hospitalName: '',
        date: '',
        time: '',
        notes: ''
    });
    const [message, setMessage] = useState('');
    const [checkingMissed, setCheckingMissed] = useState(false);

    useEffect(() => {
        loadData();
        checkMissedAppointments();
    }, []);

    const loadData = async () => {
        try {
            const aptRes = await getAppointments();
            setAppointments(aptRes.data);
            const presRes = await getPrescriptions();
            setPrescriptions(presRes.data.filter(p => p.isActive));
            
            const token = localStorage.getItem('token');
            const symRes = await axios.get('http://localhost:5000/api/symptoms', {
                headers: { 'x-auth-token': token }
            });
            setSymptoms(symRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const checkMissedAppointments = async () => {
        setCheckingMissed(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/appointments/check-missed', {}, {
                headers: { 'x-auth-token': token }
            });
            console.log('Check result:', response.data);
            
            if (response.data.updatedCount > 0) {
                setMessage({ 
                    type: 'warning', 
                    text: `${response.data.updatedCount} past appointment(s) have been marked as missed` 
                });
                setTimeout(() => setMessage(''), 5000);
            }
            
            await loadData();
        } catch (error) {
            console.error('Error checking missed appointments:', error);
        } finally {
            setCheckingMissed(false);
        }
    };

    const handlePrescriptionToggle = (prescription) => {
        const exists = selectedPrescriptions.find(p => p._id === prescription._id);
        if (exists) {
            setSelectedPrescriptions(selectedPrescriptions.filter(p => p._id !== prescription._id));
        } else {
            setSelectedPrescriptions([...selectedPrescriptions, prescription]);
        }
    };

    const handleSymptomToggle = (symptom) => {
        const exists = selectedSymptoms.find(s => s._id === symptom._id);
        if (exists) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s._id !== symptom._id));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const prescriptionIds = selectedPrescriptions.map(p => p._id);
            const prescriptionTitles = selectedPrescriptions.map(p => `${p.title || 'Untitled'} - Dr. ${p.doctorName}`);
            const symptomIds = selectedSymptoms.map(s => s._id);
            
            const appointmentData = { 
                ...formData, 
                prescriptionIds, 
                prescriptionTitles,
                symptomIds
            };
            
            await addAppointment(appointmentData);
            setShowModal(false);
            setFormData({ doctorName: '', specialty: '', hospitalName: '', date: '', time: '', notes: '' });
            setSelectedPrescriptions([]);
            setSelectedSymptoms([]);
            await loadData();
            setMessage({ type: 'success', text: 'Appointment scheduled' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to schedule appointment' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this appointment?')) {
            try {
                await deleteAppointment(id);
                await loadData();
                setMessage({ type: 'success', text: 'Appointment deleted' });
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Failed to delete appointment' });
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            scheduled: { bg: '#0066CC', label: 'Scheduled' },
            completed: { bg: '#10B981', label: 'Completed' },
            cancelled: { bg: '#EF4444', label: 'Cancelled' },
            missed: { bg: '#DC2626', label: 'Missed' }
        };
        const v = variants[status] || variants.scheduled;
        return (
            <span style={{ 
                backgroundColor: v.bg, 
                minWidth: '85px', 
                padding: '6px 12px', 
                fontSize: '12px', 
                fontWeight: '500', 
                display: 'inline-block', 
                textAlign: 'center',
                borderRadius: '20px',
                color: 'white'
            }}>
                {v.label}
            </span>
        );
    };

    const styles = {
        container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', margin: 0 },
        addButton: { backgroundColor: '#0066CC', border: 'none', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
        card: { border: 'none', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
        table: { width: '100%', borderCollapse: 'collapse' },
        tableHeader: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        headerCell: { padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px' },
        cell: { padding: '16px', verticalAlign: 'top' },
        actionCell: { padding: '16px', verticalAlign: 'top', textAlign: 'center' },
        viewButton: { backgroundColor: '#0066CC', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px', marginRight: '8px' },
        editButton: { backgroundColor: '#F59E0B', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px', marginRight: '8px', color: 'white' },
        deleteButton: { backgroundColor: '#EF4444', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8' },
        row: { borderBottom: '1px solid #E2E8F0' }
    };

    if (checkingMissed) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p>Checking for missed appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Appointments</h1>
                <Button variant="success" onClick={() => setShowModal(true)} style={styles.addButton}>
                    <FiPlus size={16} /> Schedule Appointment
                </Button>
            </div>
            
            {message && <Alert variant={message.type} style={{ borderRadius: '10px' }}>{message.text}</Alert>}
            
            <Card style={styles.card}>
                <Card.Body style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.headerCell}>Doctor</th>
                                    <th style={styles.headerCell}>Specialty</th>
                                    <th style={styles.headerCell}>Date & Time</th>
                                    <th style={styles.headerCell}>Hospital</th>
                                    <th style={styles.headerCell}>Status</th>
                                    <th style={styles.headerCell}>Actions</th>
                                   </tr>
                            </thead>
                            <tbody>
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={styles.emptyState}>No appointments scheduled</td>
                                    </tr>
                                ) : (
                                    appointments.map(a => (
                                        <tr key={a._id} style={styles.row}>
                                            <td style={styles.cell}>Dr. {a.doctorName}</td>
                                            <td style={styles.cell}>{a.specialty || '-'}</td>
                                            <td style={styles.cell}>
                                                {new Date(a.date).toLocaleDateString()} at {a.time}
                                            </td>
                                            <td style={styles.cell}>{a.hospitalName || '-'}</td>
                                            <td style={styles.cell}>{getStatusBadge(a.status)}</td>
                                            <td style={styles.actionCell}>
                                                <Link to={`/appointments/${a._id}`}>
                                                    <Button size="sm" style={styles.viewButton}>View</Button>
                                                </Link>
                                                <Link to={`/edit_appointment/${a._id}`}>
                                                    <Button size="sm" style={styles.editButton}>Edit</Button>
                                                </Link>
                                                <Button size="sm" style={styles.deleteButton} onClick={() => handleDelete(a._id)}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Appointment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Doctor Name</Form.Label>
                            <Form.Control 
                                required 
                                value={formData.doctorName} 
                                onChange={(e) => setFormData({...formData, doctorName: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Specialty</Form.Label>
                            <Form.Control 
                                value={formData.specialty} 
                                onChange={(e) => setFormData({...formData, specialty: e.target.value})} 
                                placeholder="e.g., Cardiologist"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Hospital / Clinic</Form.Label>
                            <Form.Control 
                                value={formData.hospitalName} 
                                onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                required 
                                value={formData.date} 
                                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Time</Form.Label>
                            <Form.Control 
                                type="time" 
                                required 
                                value={formData.time} 
                                onChange={(e) => setFormData({...formData, time: e.target.value})} 
                            />
                        </Form.Group>
                        
                        <Form.Label>Link Prescriptions (Optional)</Form.Label>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                            {prescriptions.length === 0 ? (
                                <p className="text-muted">No prescriptions found</p>
                            ) : (
                                prescriptions.map(p => (
                                    <Form.Check 
                                        key={p._id} 
                                        type="checkbox" 
                                        label={`${p.title || 'Untitled'} - Dr. ${p.doctorName} (${new Date(p.prescriptionDate).toLocaleDateString()})`} 
                                        checked={!!selectedPrescriptions.find(sp => sp._id === p._id)} 
                                        onChange={() => handlePrescriptionToggle(p)} 
                                    />
                                ))
                            )}
                        </div>
                        
                        <Form.Label>Link Symptoms to Discuss (Optional)</Form.Label>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                            {symptoms.length === 0 ? (
                                <p className="text-muted">No symptoms logged</p>
                            ) : (
                                symptoms.slice(0, 10).map(s => (
                                    <Form.Check 
                                        key={s._id} 
                                        type="checkbox" 
                                        label={`${s.symptom} (${s.severity}) - ${new Date(s.date).toLocaleDateString()}`} 
                                        checked={!!selectedSymptoms.find(ss => ss._id === s._id)} 
                                        onChange={() => handleSymptomToggle(s)} 
                                    />
                                ))
                            )}
                        </div>
                        
                        <Form.Group className="mt-3">
                            <Form.Label>My Notes / Reminders</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={formData.notes} 
                                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                placeholder="What do you want to discuss with the doctor?" 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="success">Schedule</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AppointmentManager;