import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Alert, Container, Badge, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { FiArrowLeft, FiEdit2, FiPower, FiUser, FiCalendar, FiFileText, FiActivity, FiSun, FiSunrise, FiSunset, FiMoon, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PrescriptionView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [medicineSelections, setMedicineSelections] = useState({});

    useEffect(() => {
        fetchPrescription();
    }, [id]);

    const fetchPrescription = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/prescriptions/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setPrescription(response.data);
            
            const medResponse = await axios.get(`http://localhost:5000/api/medicines/prescription/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setMedicines(medResponse.data);
        } catch (err) {
            setError('Failed to load prescription');
        } finally {
            setLoading(false);
        }
    };

    const openDeactivateModal = () => {
        const selections = {};
        medicines.forEach(med => {
            selections[med._id] = med.isActive;
        });
        setMedicineSelections(selections);
        setShowDeactivateModal(true);
    };

    const openActivateModal = () => {
        const selections = {};
        medicines.forEach(med => {
            selections[med._id] = med.isActive;
        });
        setMedicineSelections(selections);
        setShowActivateModal(true);
    };

    const handleMedicineToggle = (medicineId) => {
        setMedicineSelections(prev => ({
            ...prev,
            [medicineId]: !prev[medicineId]
        }));
    };

    const handleSelectAll = (keep) => {
        const selections = {};
        medicines.forEach(med => {
            selections[med._id] = keep;
        });
        setMedicineSelections(selections);
    };

    const confirmDeactivate = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const medicinesToDeactivate = medicines
                .filter(med => medicineSelections[med._id] === false && med.isActive === true)
                .map(med => med._id);
            
            await axios.patch(`http://localhost:5000/api/prescriptions/${id}/toggle`, {
                action: 'deactivate',
                deactivateMedicines: medicinesToDeactivate
            }, {
                headers: { 'x-auth-token': token }
            });
            
            setShowDeactivateModal(false);
            fetchPrescription();
            
            setMessage({ 
                type: 'success', 
                text: medicinesToDeactivate.length === 0 
                    ? 'Prescription deactivated. All medications remain active.'
                    : `Prescription deactivated. ${medicinesToDeactivate.length} medication(s) have been deactivated.` 
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deactivating prescription:', error);
            setMessage({ type: 'danger', text: 'Failed to update prescription status' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const confirmActivate = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const medicinesToActivate = medicines
                .filter(med => medicineSelections[med._id] === true && med.isActive === false)
                .map(med => med._id);
            
            await axios.patch(`http://localhost:5000/api/prescriptions/${id}/toggle`, {
                action: 'activate',
                activateMedicines: medicinesToActivate
            }, {
                headers: { 'x-auth-token': token }
            });
            
            setShowActivateModal(false);
            fetchPrescription();
            
            setMessage({ 
                type: 'success', 
                text: medicinesToActivate.length === 0 
                    ? 'Prescription activated. All medications remain as they were.'
                    : `Prescription activated. ${medicinesToActivate.length} medication(s) have been activated.` 
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error activating prescription:', error);
            setMessage({ type: 'danger', text: 'Failed to update prescription status' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const toggleMedicationStatus = async (medicineId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/medicines/${medicineId}/toggle`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchPrescription();
            setMessage({ type: 'success', text: 'Medication status updated' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update medication status' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
        title: { fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
        buttonGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
        backButton: { backgroundColor: '#F1F5F9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
        editButton: { backgroundColor: '#0066CC', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
        deactivateButton: { backgroundColor: '#EF4444', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
        activateButton: { backgroundColor: '#10B981', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
        card: { border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden', background: 'white' },
        cardHeader: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
        cardHeaderTitle: { fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
        cardBody: { padding: '24px' },
        infoRow: { display: 'flex', marginBottom: '14px', flexWrap: 'wrap' },
        label: { width: '130px', fontWeight: '500', color: '#64748B', fontSize: '13px' },
        value: { flex: 1, color: '#1E293B', fontSize: '14px', fontWeight: '500' },
        medicationItem: { border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', marginBottom: '16px', backgroundColor: '#FAFCFE' },
        medicationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
        badge: { backgroundColor: '#0066CC', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        activeBadge: { backgroundColor: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' },
        inactiveBadge: { backgroundColor: '#94A3B8', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' },
        dosageGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px', marginBottom: '16px' },
        dosageCard: { backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', textAlign: 'center' },
        dosageLabel: { fontSize: '11px', color: '#64748B', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
        dosageValue: { fontSize: '14px', fontWeight: '600', color: '#1E293B' },
        prescriptionStatusActive: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#D1FAE5', color: '#059669', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
        prescriptionStatusInactive: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#F1F5F9', color: '#64748B', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
        medToggleButton: { backgroundColor: '#F59E0B', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' },
        modalBody: { padding: '20px' },
        medicineCheckItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #E2E8F0' },
        medicineCheckName: { fontWeight: '500', color: '#1E293B' },
        medicineCheckStatus: { fontSize: '12px', color: '#64748B' },
        modalButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }
    };

    if (loading) {
        return (
            <Container fluid style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading prescription...</div>
            </Container>
        );
    }

    if (error || !prescription) {
        return (
            <Container fluid style={styles.container}>
                <Alert variant="danger" style={{ borderRadius: '12px', border: 'none' }}>{error || 'Prescription not found'}</Alert>
                <Link to="/prescriptions"><Button style={styles.backButton}><FiArrowLeft size={14} /> Back to Prescriptions</Button></Link>
            </Container>
        );
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Prescription Details</h1>
                <div style={styles.buttonGroup}>
                    <Link to="/prescriptions">
                        <Button style={styles.backButton}><FiArrowLeft size={14} /> Back</Button>
                    </Link>
                    <Link to={`/edit_prescription/${id}`}>
                        <Button style={styles.editButton}><FiEdit2 size={14} /> Edit</Button>
                    </Link>
                    {prescription.isActive ? (
                        <Button style={styles.deactivateButton} onClick={openDeactivateModal}>
                            <FiPower size={14} /> Deactivate Prescription
                        </Button>
                    ) : (
                        <Button style={styles.activateButton} onClick={openActivateModal}>
                            <FiPower size={14} /> Activate Prescription
                        </Button>
                    )}
                </div>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}>{message.text}</Alert>}

            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}><FiFileText size={16} /> Basic Information</h5>
                    <div>
                        {prescription.isActive ? (
                            <span style={styles.prescriptionStatusActive}>
                                <FiCheckCircle size={12} /> Active
                            </span>
                        ) : (
                            <span style={styles.prescriptionStatusInactive}>
                                <FiXCircle size={12} /> Inactive
                            </span>
                        )}
                    </div>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Title:</div>
                        <div style={styles.value}>{prescription.title || 'Untitled'}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Category:</div>
                        <div style={styles.value}>{prescription.category?.toUpperCase() || 'Other'}</div>
                    </div>
                </div>
            </Card>

            {/* Doctor info */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}><FiUser size={16} /> Doctor Information</h5>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Doctor Name:</div>
                        <div style={styles.value}>{prescription.doctorName || 'Not specified'}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Specialty:</div>
                        <div style={styles.value}>{prescription.doctorSpecialty || 'Not specified'}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Hospital/Clinic:</div>
                        <div style={styles.value}>{prescription.hospitalName || 'Not specified'}</div>
                    </div>
                </div>
            </Card>

            {/* Medications */}
            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}><FiActivity size={16} /> Medications</h5>
                </div>
                <div style={styles.cardBody}>
                    {medicines.length === 0 ? (
                        <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px' }}>No medications added</div>
                    ) : (
                        medicines.map((med, idx) => (
                            <div key={med._id} style={styles.medicationItem}>
                                <div style={styles.medicationHeader}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Badge style={styles.badge}>Medication {idx + 1}</Badge>
                                        {med.isActive ? (
                                            <span style={styles.activeBadge}><FiCheckCircle size={10} /> Active</span>
                                        ) : (
                                            <span style={styles.inactiveBadge}><FiXCircle size={10} /> Inactive</span>
                                        )}
                                    </div>
                                    <Button size="sm" style={styles.medToggleButton} onClick={() => toggleMedicationStatus(med._id, med.isActive)}>
                                        <FiPower size={10} /> {med.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                                
                                <div style={styles.infoRow}>
                                    <div style={styles.label}>Drug Name:</div>
                                    <div style={styles.value}><strong>{med.drugName || 'Not specified'}</strong> {med.strength && <span style={{ color: '#64748B' }}>({med.strength})</span>}</div>
                                </div>
                                
                                <div style={styles.dosageGrid}>
                                    <div style={styles.dosageCard}>
                                        <div style={styles.dosageLabel}><FiSunrise size={10} /> Morning</div>
                                        <div style={styles.dosageValue}>{med.morning > 0 ? `${med.morning} tab(s)` : '-'}</div>
                                    </div>
                                    <div style={styles.dosageCard}>
                                        <div style={styles.dosageLabel}><FiSun size={10} /> Afternoon</div>
                                        <div style={styles.dosageValue}>{med.afternoon > 0 ? `${med.afternoon} tab(s)` : '-'}</div>
                                    </div>
                                    <div style={styles.dosageCard}>
                                        <div style={styles.dosageLabel}><FiSunset size={10} /> Evening</div>
                                        <div style={styles.dosageValue}>{med.evening > 0 ? `${med.evening} tab(s)` : '-'}</div>
                                    </div>
                                    <div style={styles.dosageCard}>
                                        <div style={styles.dosageLabel}><FiMoon size={10} /> Night</div>
                                        <div style={styles.dosageValue}>{med.night > 0 ? `${med.night} tab(s)` : '-'}</div>
                                    </div>
                                </div>
                                
                                {med.duration > 0 && (
                                    <div style={styles.infoRow}>
                                        <div style={styles.label}>Duration:</div>
                                        <div style={styles.value}>{med.duration} days</div>
                                    </div>
                                )}
                                <div style={styles.infoRow}>
                                    <div style={styles.label}>With Food:</div>
                                    <div style={styles.value}>{med.timingWithFood?.replace(/_/g, ' ') || 'No restriction'}</div>
                                </div>
                                {med.specialInstructions && (
                                    <div style={styles.infoRow}>
                                        <div style={styles.label}>Instructions:</div>
                                        <div style={styles.value}><span style={{ fontStyle: 'italic', color: '#64748B' }}>{med.specialInstructions}</span></div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Clinical info */}
            {(prescription.diagnosis || prescription.notes) && (
                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Clinical Information</h5>
                    </div>
                    <div style={styles.cardBody}>
                        {prescription.diagnosis && (
                            <div style={styles.infoRow}>
                                <div style={styles.label}>Diagnosis:</div>
                                <div style={styles.value}>{prescription.diagnosis}</div>
                            </div>
                        )}
                        {prescription.notes && (
                            <div style={styles.infoRow}>
                                <div style={styles.label}>Doctor's Notes:</div>
                                <div style={styles.value}>{prescription.notes}</div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}><FiCalendar size={16} /> Dates</h5>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Prescription Date:</div>
                        <div style={styles.value}>{new Date(prescription.prescriptionDate).toLocaleDateString()}</div>
                    </div>
                    {prescription.followUpDate && (
                        <div style={styles.infoRow}>
                            <div style={styles.label}>Follow-up Date:</div>
                            <div style={styles.value}>{new Date(prescription.followUpDate).toLocaleDateString()}</div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Deactivate */}
            <Modal show={showDeactivateModal} onHide={() => setShowDeactivateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Deactivate Prescription</Modal.Title>
                </Modal.Header>
                <Modal.Body style={styles.modalBody}>
                    <p>Select which medications to keep active:</p>
                    
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                        <Button size="sm" variant="success" onClick={() => handleSelectAll(true)}>Keep All Active</Button>
                        <Button size="sm" variant="danger" onClick={() => handleSelectAll(false)}>Deactivate All</Button>
                    </div>
                    
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                        {medicines.map(med => (
                            <div key={med._id} style={styles.medicineCheckItem}>
                                <div>
                                    <div style={styles.medicineCheckName}>{med.drugName}</div>
                                    <div style={styles.medicineCheckStatus}>
                                        {med.strength && `${med.strength} • `}
                                        {med.morning > 0 && `Morning ${med.morning} `}
                                        {med.afternoon > 0 && `Afternoon ${med.afternoon} `}
                                        {med.evening > 0 && `Evening ${med.evening} `}
                                        {med.night > 0 && `Night ${med.night}`}
                                        {!med.isActive && <span style={{ color: '#EF4444', marginLeft: '8px' }}>(Currently Inactive)</span>}
                                    </div>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    label="Keep Active"
                                    checked={medicineSelections[med._id] === true}
                                    onChange={() => handleMedicineToggle(med._id)}
                                    disabled={!med.isActive}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.modalButtons}>
                        <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDeactivate}>Confirm Deactivate</Button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={showActivateModal} onHide={() => setShowActivateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Activate Prescription</Modal.Title>
                </Modal.Header>
                <Modal.Body style={styles.modalBody}>
                    <p>Select which medications to activate:</p>
                    
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                        <Button size="sm" variant="success" onClick={() => handleSelectAll(true)}>Activate All</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleSelectAll(false)}>Keep All Inactive</Button>
                    </div>
                    
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                        {medicines.map(med => (
                            <div key={med._id} style={styles.medicineCheckItem}>
                                <div>
                                    <div style={styles.medicineCheckName}>{med.drugName}</div>
                                    <div style={styles.medicineCheckStatus}>
                                        {med.strength && `${med.strength} • `}
                                        {med.morning > 0 && `Morning ${med.morning} `}
                                        {med.afternoon > 0 && `Afternoon ${med.afternoon} `}
                                        {med.evening > 0 && `Evening ${med.evening} `}
                                        {med.night > 0 && `Night ${med.night}`}
                                        {med.isActive && <span style={{ color: '#10B981', marginLeft: '8px' }}>(Currently Active)</span>}
                                    </div>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    label="Activate"
                                    checked={medicineSelections[med._id] === true}
                                    onChange={() => handleMedicineToggle(med._id)}
                                    disabled={med.isActive}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.modalButtons}>
                        <Button variant="secondary" onClick={() => setShowActivateModal(false)}>Cancel</Button>
                        <Button variant="success" onClick={confirmActivate}>Confirm Activate</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default PrescriptionView;