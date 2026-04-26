import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col, Badge, Container } from 'react-bootstrap';
import axios from 'axios';
import { addPrescription } from '../services/api';
import { FiPlus, FiTrash2, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';

const PrescriptionUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');

    const [prescription, setPrescription] = useState({
        title: '',
        category: 'other',
        doctorName: '',
        doctorSpecialty: '',
        hospitalName: '',
        diagnosis: '',
        notes: '',
        prescriptionDate: new Date().toISOString().split('T')[0],
        followUpDate: '',
        medications: [
            {
                drugName: '',
                strength: '',
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0,
                duration: 0,
                timingWithFood: 'no restriction',
                specialInstructions: ''
            }
        ]
    });

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/appointments', {
                headers: { 'x-auth-token': token }
            });
            setAppointments(res.data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const categories = [
        'cardiovascular', 'diabetes', 'respiratory', 'neurology', 'mental health',
        'cancer', 'autoimmune', 'digestive', 'infection', 'pain management',
        'thyroid', 'kidney', 'eye', 'skin', 'hormonal', 'vaccination', 'vitamins', 'other'
    ];

    const timings = [
        { key: 'morning', label: 'Morning' },
        { key: 'afternoon', label: 'Afternoon' },
        { key: 'evening', label: 'Evening' },
        { key: 'night', label: 'Night' }
    ];

    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
        title: { fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
        card: { border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden', background: 'white' },
        cardHeader: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '18px 24px' },
        cardHeaderTitle: { fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
        cardBody: { padding: '24px' },
        label: { fontWeight: '500', fontSize: '13px', color: '#334155', marginBottom: '6px', display: 'block' },
        input: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF', transition: 'all 0.2s' },
        textarea: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF', resize: 'vertical' },
        select: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF' },
        medicationCard: { border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', marginBottom: '20px', backgroundColor: '#FAFCFE' },
        badge: { backgroundColor: '#0066CC', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        addButton: { backgroundColor: 'transparent', color: '#0066CC', border: '1px solid #0066CC', padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
        saveButton: { backgroundColor: '#0066CC', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'white' },
        cancelButton: { backgroundColor: '#F1F5F9', color: '#475569', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '14px', fontWeight: '500' },
        doctorInputWrapper: { position: 'relative' },
        doctorSuggestions: { 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            background: 'white', 
            border: '1px solid #E2E8F0', 
            borderRadius: '10px', 
            marginTop: '4px',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        doctorSuggestion: { 
            padding: '12px 14px', 
            borderBottom: '1px solid #E2E8F0', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            backgroundColor: 'white'
        },
        doctorSuggestionLast: { borderBottom: 'none' },
        doctorName: { fontWeight: '600', fontSize: '14px', color: '#0F172A' },
        doctorDetails: { fontSize: '12px', color: '#64748B', marginTop: '4px' },
        dosageGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' },
        dosageField: { textAlign: 'center' },
        dosageLabel: { fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' },
        dosageInput: { textAlign: 'center', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px', width: '100%' }
    };

    const handleNumberChange = (field, value, medicationIndex = null) => {
        const numValue = value === '' ? 0 : parseInt(value) || 0;
        if (medicationIndex !== null) {
            updateMedication(medicationIndex, field, numValue);
        } else {
            setPrescription({ ...prescription, [field]: numValue });
        }
    };

    const addMedication = () => {
        setPrescription({
            ...prescription,
            medications: [...prescription.medications, {
                drugName: '', strength: '',
                morning: 0, afternoon: 0, evening: 0, night: 0,
                duration: 0, timingWithFood: 'no restriction', specialInstructions: ''
            }]
        });
    };

    const removeMedication = (index) => {
        const newMeds = prescription.medications.filter((_, i) => i !== index);
        setPrescription({ ...prescription, medications: newMeds });
    };

    const updateMedication = (index, field, value) => {
        const newMeds = [...prescription.medications];
        newMeds[index][field] = value;
        setPrescription({ ...prescription, medications: newMeds });
    };

    const updateField = (field, value) => {
        setPrescription({ ...prescription, [field]: value });
    };

    const handleDoctorSelect = (doctor) => {
        updateField('doctorName', doctor.doctorName);
        updateField('doctorSpecialty', doctor.specialty || '');
        updateField('hospitalName', doctor.hospitalName || '');
        setShowDoctorSuggestions(false);
        setDoctorSearchTerm(doctor.doctorName);
    };

    const uniqueDoctors = [];
    const doctorMap = new Map();
    appointments.forEach(apt => {
        if (!doctorMap.has(apt.doctorName)) {
            doctorMap.set(apt.doctorName, apt);
            uniqueDoctors.push(apt);
        }
    });

    const filteredDoctors = uniqueDoctors.filter(apt => 
        apt.doctorName?.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        apt.specialty?.toLowerCase().includes(doctorSearchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const prescriptionData = {
            title: prescription.title,
            category: prescription.category,
            doctorName: prescription.doctorName,
            doctorSpecialty: prescription.doctorSpecialty,
            hospitalName: prescription.hospitalName,
            diagnosis: prescription.diagnosis,
            notes: prescription.notes,
            prescriptionDate: prescription.prescriptionDate,
            followUpDate: prescription.followUpDate || null
        };
        
        try {
            const presResponse = await addPrescription(prescriptionData);
            const newPrescriptionId = presResponse.data._id;
            
            const token = localStorage.getItem('token');
            let savedMedicines = 0;
            
            for (const med of prescription.medications) {
                if (med.drugName && med.drugName.trim() !== '') {
                    let endDate = '';
                    if (med.duration > 0) {
                        const startDateObj = new Date(prescription.prescriptionDate);
                        const endDateObj = new Date(startDateObj);
                        endDateObj.setDate(startDateObj.getDate() + med.duration);
                        endDate = endDateObj.toISOString().split('T')[0];
                    }
                    
                    const medicineData = {
                        prescriptionId: newPrescriptionId,
                        drugName: med.drugName,
                        strength: med.strength || '',
                        morning: med.morning || 0,
                        afternoon: med.afternoon || 0,
                        evening: med.evening || 0,
                        night: med.night || 0,
                        duration: med.duration || 0,
                        timingWithFood: med.timingWithFood || 'no restriction',
                        specialInstructions: med.specialInstructions || '',
                        startDate: prescription.prescriptionDate,
                        endDate: endDate,
                        isActive: true
                    };
                    
                    await axios.post('http://localhost:5000/api/medicines', medicineData, {
                        headers: { 'x-auth-token': token }
                    });
                    savedMedicines++;
                }
            }
            
            setSuccess(`Prescription and ${savedMedicines} medicine(s) saved successfully`);
            setTimeout(() => navigate('/prescriptions'), 2000);
        } catch (err) {
            console.error('Save error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Add Prescription</h1>
            </div>

            <Form onSubmit={handleSubmit}>
                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}><FiFileText size={16} /> Basic Information</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Prescription Title</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={prescription.title} 
                                        onChange={(e) => updateField('title', e.target.value)} 
                                        placeholder="e.g., Hypertension Treatment" 
                                        style={styles.input} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Category</Form.Label>
                                    <Form.Select value={prescription.category} onChange={(e) => updateField('category', e.target.value)} style={styles.select}>
                                        {categories.map(cat => (<option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Card>

                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}><FiUser size={16} /> Doctor Information</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Doctor Name</Form.Label>
                                    <div style={styles.doctorInputWrapper}>
                                        <Form.Control 
                                            type="text" 
                                            value={doctorSearchTerm || prescription.doctorName} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setDoctorSearchTerm(value);
                                                updateField('doctorName', value);
                                                setShowDoctorSuggestions(true);
                                            }}
                                            onFocus={() => setShowDoctorSuggestions(true)}
                                            placeholder="Select or type doctor name" 
                                            style={styles.input} 
                                            required 
                                        />
                                        {showDoctorSuggestions && filteredDoctors.length > 0 && (
                                            <div style={styles.doctorSuggestions}>
                                                {filteredDoctors.map((apt, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        style={{ ...styles.doctorSuggestion, ...(idx === filteredDoctors.length - 1 ? styles.doctorSuggestionLast : {}) }}
                                                        onClick={() => handleDoctorSelect(apt)}
                                                    >
                                                        <div style={styles.doctorName}>Dr. {apt.doctorName}</div>
                                                        <div style={styles.doctorDetails}>
                                                            {apt.specialty && <span>{apt.specialty}</span>}
                                                            {apt.specialty && apt.hospitalName && <span> • </span>}
                                                            {apt.hospitalName && <span>{apt.hospitalName}</span>}
                                                            {apt.date && <span> • Last visit: {new Date(apt.date).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                                        Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} from your appointments
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Specialty</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={prescription.doctorSpecialty} 
                                        onChange={(e) => updateField('doctorSpecialty', e.target.value)} 
                                        placeholder="e.g., Cardiologist" 
                                        style={styles.input} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Hospital / Clinic</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={prescription.hospitalName} 
                                        onChange={(e) => updateField('hospitalName', e.target.value)} 
                                        style={styles.input} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Card>

                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Medications</h5>
                    </div>
                    <div style={styles.cardBody}>
                        {prescription.medications.map((med, idx) => (
                            <div key={idx} style={styles.medicationCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <Badge style={styles.badge}>Medication {idx + 1}</Badge>
                                    {prescription.medications.length > 1 && (
                                        <Button variant="danger" size="sm" onClick={() => removeMedication(idx)} style={{ backgroundColor: '#EF4444', border: 'none' }}>
                                            <FiTrash2 size={12} /> Remove
                                        </Button>
                                    )}
                                </div>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={styles.label}>Drug Name</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={med.drugName} 
                                                onChange={(e) => updateMedication(idx, 'drugName', e.target.value)} 
                                                style={styles.input} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={styles.label}>Strength</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={med.strength} 
                                                onChange={(e) => updateMedication(idx, 'strength', e.target.value)} 
                                                placeholder="500mg" 
                                                style={styles.input} 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={styles.label}>Duration (days)</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                inputMode="numeric"
                                                value={med.duration} 
                                                onChange={(e) => updateMedication(idx, 'duration', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)} 
                                                placeholder="30"
                                                style={styles.input} 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div style={styles.dosageGrid}>
                                    {timings.map(timing => (
                                        <div key={timing.key} style={styles.dosageField}>
                                            <div style={styles.dosageLabel}>{timing.label}</div>
                                            <Form.Control
                                                type="text"
                                                inputMode="numeric"
                                                value={med[timing.key] || 0}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateMedication(idx, timing.key, val === '' ? 0 : parseInt(val) || 0);
                                                }}
                                                placeholder="0"
                                                style={styles.dosageInput}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={styles.label}>With Food</Form.Label>
                                            <Form.Select value={med.timingWithFood} onChange={(e) => updateMedication(idx, 'timingWithFood', e.target.value)} style={styles.select}>
                                                <option value="no restriction">No restriction</option>
                                                <option value="before food">Before food</option>
                                                <option value="after food">After food</option>
                                                <option value="with food">With food</option>
                                                <option value="empty stomach">Empty stomach</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={styles.label}>Special Instructions</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={med.specialInstructions} 
                                                onChange={(e) => updateMedication(idx, 'specialInstructions', e.target.value)} 
                                                placeholder="e.g., Drink plenty of water" 
                                                style={styles.input} 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Button variant="link" onClick={addMedication} style={styles.addButton}>
                            <FiPlus size={14} /> Add Another Medication
                        </Button>
                    </div>
                </Card>

                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Clinical Information</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Diagnosis</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        value={prescription.diagnosis} 
                                        onChange={(e) => updateField('diagnosis', e.target.value)} 
                                        placeholder="What condition is being treated?" 
                                        style={styles.textarea} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Doctor's Notes</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        value={prescription.notes} 
                                        onChange={(e) => updateField('notes', e.target.value)} 
                                        placeholder="Additional instructions" 
                                        style={styles.textarea} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Card>

                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}><FiCalendar size={16} /> Dates</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Prescription Date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={prescription.prescriptionDate} 
                                        onChange={(e) => updateField('prescriptionDate', e.target.value)} 
                                        style={styles.input} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.label}>Follow-up Date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={prescription.followUpDate} 
                                        onChange={(e) => updateField('followUpDate', e.target.value)} 
                                        style={styles.input} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {error && <Alert variant="danger" style={{ borderRadius: '12px', border: 'none' }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ borderRadius: '12px', border: 'none' }}>{success}</Alert>}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', marginBottom: '40px' }}>
                    <Button type="submit" disabled={loading} style={styles.saveButton}>
                        {loading ? 'Saving...' : 'Save Prescription'}
                    </Button>
                    <Button onClick={() => navigate('/prescriptions')} style={styles.cancelButton}>Cancel</Button>
                </div>
            </Form>
        </Container>
    );
};

export default PrescriptionUpload;