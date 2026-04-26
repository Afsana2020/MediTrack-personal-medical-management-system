import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { 
  FiPlus, FiEdit2, FiTrash2, FiPower, FiLink, 
  FiAlertCircle, FiFileText, FiSun, FiMoon, 
  FiSunrise, FiSunset
} from 'react-icons/fi';

const MedicinesManager = () => {
    const [medicines, setMedicines] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
    const [formData, setFormData] = useState({
        drugName: '',
        strength: '',
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        timingWithFood: 'no restriction',
        specialInstructions: '',
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const medRes = await axios.get('http://localhost:5000/api/medicines', {
                headers: { 'x-auth-token': token }
            });
            setMedicines(medRes.data);
            
            const presRes = await axios.get('http://localhost:5000/api/prescriptions', {
                headers: { 'x-auth-token': token }
            });
            setPrescriptions(presRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredMedicines = () => {
        if (filter === 'prescription') return medicines.filter(m => m.prescriptionId);
        if (filter === 'standalone') return medicines.filter(m => !m.prescriptionId);
        return medicines;
    };

    const getPrescriptionTitle = (prescriptionId) => {
        const prescription = prescriptions.find(p => p._id === prescriptionId);
        return prescription ? prescription.title || 'Untitled Prescription' : 'Unknown';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToSend = { ...formData, prescriptionId: selectedPrescriptionId || null };
            
            if (editingMedicine) {
                await axios.put(`http://localhost:5000/api/medicines/${editingMedicine._id}`, dataToSend, {
                    headers: { 'x-auth-token': token }
                });
                setMessage({ type: 'success', text: 'Medicine updated successfully' });
            } else {
                await axios.post('http://localhost:5000/api/medicines', dataToSend, {
                    headers: { 'x-auth-token': token }
                });
                setMessage({ type: 'success', text: 'Medicine added successfully' });
            }
            setShowModal(false);
            resetForm();
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to save medicine' });
        }
    };

    const resetForm = () => {
        setEditingMedicine(null);
        setSelectedPrescriptionId('');
        setFormData({
            drugName: '',
            strength: '',
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            timingWithFood: 'no restriction',
            specialInstructions: '',
            isActive: true
        });
    };

    const handleEdit = (medicine) => {
        setEditingMedicine(medicine);
        setSelectedPrescriptionId(medicine.prescriptionId || '');
        setFormData({
            drugName: medicine.drugName,
            strength: medicine.strength || '',
            morning: medicine.morning || 0,
            afternoon: medicine.afternoon || 0,
            evening: medicine.evening || 0,
            night: medicine.night || 0,
            startDate: medicine.startDate ? medicine.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: medicine.endDate ? medicine.endDate.split('T')[0] : '',
            timingWithFood: medicine.timingWithFood || 'no restriction',
            specialInstructions: medicine.specialInstructions || '',
            isActive: medicine.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this medicine?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/medicines/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                loadData();
                setMessage({ type: 'success', text: 'Medicine deleted' });
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Failed to delete' });
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/medicines/${id}/toggle`, {}, {
                headers: { 'x-auth-token': token }
            });
            loadData();
            setMessage({ type: 'success', text: `Medicine ${currentStatus ? 'deactivated' : 'activated'}` });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update status' });
        }
    };

    const filteredMedicines = getFilteredMedicines();
    const prescriptionMedicinesCount = medicines.filter(m => m.prescriptionId).length;
    const standaloneMedicinesCount = medicines.filter(m => !m.prescriptionId).length;

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '32px 24px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: '#F8FAFC',
            minHeight: '100vh'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.02em'
        },
        addButton: {
            backgroundColor: '#0066CC',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            fontSize: '14px'
        },
        statsWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '28px'
        },
        statsRow: {
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        statCard: {
            background: 'white',
            padding: '16px 32px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            minWidth: '160px'
        },
        statNumber: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#0066CC',
            lineHeight: '1.2'
        },
        statLabel: {
            fontSize: '13px',
            color: '#64748B',
            marginTop: '6px',
            fontWeight: '500'
        },
        filterWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '28px'
        },
        filterContainer: {
            display: 'flex',
            gap: '8px',
            background: 'white',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            width: 'fit-content'
        },
        filterButton: {
            padding: '8px 24px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#64748B',
            borderRadius: '8px'
        },
        filterActive: {
            backgroundColor: '#0066CC',
            color: 'white'
        },
        card: {
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            marginBottom: '16px',
            overflow: 'hidden',
            background: 'white'
        },
        cardContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            gap: '24px',
            flexWrap: 'wrap'
        },
        leftSection: {
            flex: 1,
            minWidth: '280px'
        },
        rightSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px'
        },
        drugName: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#0F172A',
            marginBottom: '6px'
        },
        drugStrength: {
            fontSize: '13px',
            color: '#64748B',
            marginLeft: '8px',
            fontWeight: '400'
        },
        badgeGroup: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px'
        },
        badge: {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-block'
        },
        badgePrescription: {
            background: '#F3E8FF',
            color: '#7C3AED'
        },
        badgeStandalone: {
            background: '#FEF3C7',
            color: '#D97706'
        },
        badgeActive: {
            background: '#D1FAE5',
            color: '#059669'
        },
        badgeInactive: {
            background: '#F1F5F9',
            color: '#64748B'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, auto)',
            gap: '8px 16px',
            marginTop: '8px'
        },
        infoItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px'
        },
        infoLabel: {
            color: '#64748B',
            minWidth: '70px'
        },
        infoValue: {
            color: '#334155'
        },
        dosageChips: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        chip: {
            background: '#F1F5F9',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        },
        link: {
            color: '#0066CC',
            textDecoration: 'none',
            fontSize: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        },
        instructions: {
            background: '#F8FAFC',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#64748B',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        actionButtons: {
            display: 'flex',
            gap: '8px',
            flexDirection: 'column',
            alignItems: 'flex-end'
        },
        btnGroup: {
            display: 'flex',
            gap: '8px'
        },
        btnEdit: {
            backgroundColor: '#F59E0B',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        btnToggle: {
            backgroundColor: '#0066CC',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        btnDelete: {
            backgroundColor: '#EF4444',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
        },
        modalHeader: {
            borderBottom: '1px solid #E2E8F0',
            padding: '20px 24px'
        },
        modalBody: {
            padding: '24px'
        },
        modalFooter: {
            borderTop: '1px solid #E2E8F0',
            padding: '16px 24px',
            background: '#F8FAFC'
        },
        formLabel: {
            fontWeight: '500',
            fontSize: '13px',
            color: '#334155',
            marginBottom: '6px',
            display: 'block'
        },
        formInput: {
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '10px 12px',
            fontSize: '14px',
            width: '100%'
        },
        dosageGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
        },
        dosageField: {
            textAlign: 'center'
        },
        dosageLabel: {
            fontSize: '11px',
            color: '#64748B',
            display: 'block',
            marginBottom: '4px'
        },
        dosageInput: {
            textAlign: 'center',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            padding: '8px',
            width: '100%'
        }
    };

    const handleNumberChange = (field, value) => {
        const numValue = value === '' ? 0 : parseInt(value) || 0;
        setFormData({...formData, [field]: numValue});
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', background: '#F8FAFC' }}>
                <div style={{ color: '#94A3B8' }}>Loading medicines...</div>
            </div>
        );
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Medicines Manager</h1>
                <Button style={styles.addButton} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FiPlus size={16} /> Add Medicine
                </Button>
            </div>

            <div style={styles.statsWrapper}>
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{medicines.length}</div>
                        <div style={styles.statLabel}>Total Medicines</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{prescriptionMedicinesCount}</div>
                        <div style={styles.statLabel}>From Prescriptions</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{standaloneMedicinesCount}</div>
                        <div style={styles.statLabel}>Standalone</div>
                    </div>
                </div>
            </div>

            <div style={styles.filterWrapper}>
                <div style={styles.filterContainer}>
                    <button
                        style={{ ...styles.filterButton, ...(filter === 'all' ? styles.filterActive : {}) }}
                        onClick={() => setFilter('all')}
                    >
                        All Medicines
                    </button>
                    <button
                        style={{ ...styles.filterButton, ...(filter === 'prescription' ? styles.filterActive : {}) }}
                        onClick={() => setFilter('prescription')}
                    >
                        From Prescriptions
                    </button>
                    <button
                        style={{ ...styles.filterButton, ...(filter === 'standalone' ? styles.filterActive : {}) }}
                        onClick={() => setFilter('standalone')}
                    >
                        Standalone
                    </button>
                </div>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px', marginBottom: '20px', border: 'none' }}>{message.text}</Alert>}

            {filteredMedicines.length === 0 ? (
                <div style={styles.emptyState}>
                    <FiFileText size={48} strokeWidth={1.5} style={{ marginBottom: '16px', color: '#CBD5E1' }} />
                    <p style={{ color: '#94A3B8' }}>No medicines found</p>
                </div>
            ) : (
                filteredMedicines.map(med => (
                    <Card key={med._id} style={styles.card}>
                        <div style={styles.cardContent}>
                            <div style={styles.leftSection}>
                                <div>
                                    <span style={styles.drugName}>
                                        {med.drugName}
                                        {med.strength && <span style={styles.drugStrength}>• {med.strength}</span>}
                                    </span>
                                </div>
                                
                                <div style={styles.badgeGroup}>
                                    {med.prescriptionId ? (
                                        <span style={{ ...styles.badge, ...styles.badgePrescription }}>From Prescription</span>
                                    ) : (
                                        <span style={{ ...styles.badge, ...styles.badgeStandalone }}>Standalone</span>
                                    )}
                                    <span style={{ ...styles.badge, ...(med.isActive ? styles.badgeActive : styles.badgeInactive) }}>
                                        {med.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Schedule:</span>
                                        <div style={styles.dosageChips}>
                                            {med.morning > 0 && <span style={styles.chip}><FiSunrise size={12} /> {med.morning} Morning</span>}
                                            {med.afternoon > 0 && <span style={styles.chip}><FiSun size={12} /> {med.afternoon} Afternoon</span>}
                                            {med.evening > 0 && <span style={styles.chip}><FiSunset size={12} /> {med.evening} Evening</span>}
                                            {med.night > 0 && <span style={styles.chip}><FiMoon size={12} /> {med.night} Night</span>}
                                            {!med.morning && !med.afternoon && !med.evening && !med.night && <span>Not scheduled</span>}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>With Food:</span>
                                        <span style={styles.infoValue}>{med.timingWithFood?.replace(/_/g, ' ') || 'No restriction'}</span>
                                    </div>
                                    
                                    {(med.startDate || med.endDate) && (
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Duration:</span>
                                            <span style={styles.infoValue}>
                                                {med.startDate && `From ${new Date(med.startDate).toLocaleDateString()}`}
                                                {med.endDate && ` to ${new Date(med.endDate).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {med.prescriptionId && (
                                    <Link to={`/prescriptions/${med.prescriptionId}`} style={styles.link}>
                                        <FiLink size={12} /> View Prescription
                                    </Link>
                                )}

                                {med.specialInstructions && (
                                    <div style={styles.instructions}>
                                        <FiAlertCircle size={12} />
                                        <span>{med.specialInstructions}</span>
                                    </div>
                                )}
                            </div>

                            <div style={styles.rightSection}>
                                <div style={styles.btnGroup}>
                                    <Button size="sm" style={styles.btnEdit} onClick={() => handleEdit(med)}>
                                        <FiEdit2 size={12} /> Edit
                                    </Button>
                                    <Button size="sm" style={styles.btnToggle} onClick={() => toggleStatus(med._id, med.isActive)}>
                                        <FiPower size={12} /> {med.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button size="sm" style={styles.btnDelete} onClick={() => handleDelete(med._id)}>
                                        <FiTrash2 size={12} /> Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            )}

            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg" centered>
                <Modal.Header closeButton style={styles.modalHeader}>
                    <Modal.Title style={{ fontSize: '20px', fontWeight: '600' }}>
                        {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body style={styles.modalBody}>
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Drug Name</Form.Label>
                            <Form.Control 
                                required 
                                value={formData.drugName} 
                                onChange={(e) => setFormData({...formData, drugName: e.target.value})}
                                style={styles.formInput}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Strength</Form.Label>
                            <Form.Control 
                                placeholder="e.g., 500mg, 10ml" 
                                value={formData.strength} 
                                onChange={(e) => setFormData({...formData, strength: e.target.value})}
                                style={styles.formInput}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Link to Prescription (Optional)</Form.Label>
                            <Form.Select 
                                value={selectedPrescriptionId} 
                                onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                                style={styles.formInput}
                            >
                                <option value="">Standalone Medicine (No Prescription)</option>
                                {prescriptions.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.title || 'Untitled'} - Dr. {p.doctorName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Dosage Schedule</Form.Label>
                            <div style={styles.dosageGrid}>
                                <div style={styles.dosageField}>
                                    <div style={styles.dosageLabel}>Morning</div>
                                    <Form.Control 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formData.morning} 
                                        onChange={(e) => handleNumberChange('morning', e.target.value)} 
                                        style={styles.dosageInput}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={styles.dosageField}>
                                    <div style={styles.dosageLabel}>Afternoon</div>
                                    <Form.Control 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formData.afternoon} 
                                        onChange={(e) => handleNumberChange('afternoon', e.target.value)} 
                                        style={styles.dosageInput}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={styles.dosageField}>
                                    <div style={styles.dosageLabel}>Evening</div>
                                    <Form.Control 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formData.evening} 
                                        onChange={(e) => handleNumberChange('evening', e.target.value)} 
                                        style={styles.dosageInput}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={styles.dosageField}>
                                    <div style={styles.dosageLabel}>Night</div>
                                    <Form.Control 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formData.night} 
                                        onChange={(e) => handleNumberChange('night', e.target.value)} 
                                        style={styles.dosageInput}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </Form.Group>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>Start Date</Form.Label>
                                <Form.Control type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} style={styles.formInput} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>End Date (Optional)</Form.Label>
                                <Form.Control type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} style={styles.formInput} />
                            </Form.Group>
                        </div>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Take with Food</Form.Label>
                            <Form.Select value={formData.timingWithFood} onChange={(e) => setFormData({...formData, timingWithFood: e.target.value})} style={styles.formInput}>
                                <option value="no restriction">No restriction</option>
                                <option value="before food">Before food</option>
                                <option value="after food">After food</option>
                                <option value="with food">With food</option>
                                <option value="empty stomach">Empty stomach</option>
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Special Instructions</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.specialInstructions} onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})} style={styles.formInput} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={styles.modalFooter}>
                        <Button variant="light" onClick={() => { setShowModal(false); resetForm(); }} style={{ borderRadius: '10px' }}>Cancel</Button>
                        <Button type="submit" style={{ background: '#0066CC', border: 'none', borderRadius: '10px' }}>Save Medicine</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default MedicinesManager;