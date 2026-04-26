import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import axios from 'axios';
import { getPrescriptions } from '../services/api';

const ActiveMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

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
            
    
            const presRes = await getPrescriptions();
            const allPrescriptionMeds = [];
            presRes.data.forEach(prescription => {
                if (prescription.medications && prescription.medications.length > 0) {
                    prescription.medications.forEach((med, index) => {
                        if (med.isActive && med.drugName) {
                            allPrescriptionMeds.push({
                                ...med,
                                source: 'prescription',
                                prescriptionId: prescription._id,
                                prescriptionTitle: prescription.title || 'Untitled',
                                prescriptionDoctor: prescription.doctorName,
                                medicationIndex: index
                            });
                        }
                    });
                }
            });
            setPrescriptionMedicines(allPrescriptionMeds);
            
        } catch (error) {
            console.error('Error loading medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStandaloneMedicine = async (medicineId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/medicines/${medicineId}/toggle`, {}, {
                headers: { 'x-auth-token': token }
            });
            loadData();
            setMessage({ type: 'success', text: 'Status updated' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const togglePrescriptionMedicine = async (prescriptionId, medIndex, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/medication/${medIndex}/toggle`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            loadData();
            setMessage({ type: 'success', text: 'Status updated' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const activeStandalone = medicines.filter(med => med.isActive === true);
    const allActiveMeds = [...activeStandalone, ...prescriptionMedicines];
    const totalActive = allActiveMeds.length;

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

    return (
        <Container style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Active Medicines</h1>
            <p style={{ color: '#64748B', marginBottom: '24px' }}>Currently active medications from prescriptions and standalone medicines</p>
            
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#0066CC' }}>{totalActive}</div>
                <div style={{ fontSize: '14px', color: '#475569' }}>Active Medications</div>
            </div>

            {message && <Alert variant={message.type}>{message.text}</Alert>}

            {totalActive === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>No active medications. <Link to="/add_prescription">Add a prescription</Link></div>
            ) : (
                <>
                    {/* Standalone Medicines Section */}
                    {activeStandalone.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '8px' }}>Standalone Medicines</h3>
                            {activeStandalone.map((med, idx) => (
                                <div key={`standalone-${idx}`} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '600' }}>{med.drugName}</div>
                                            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                                                {med.strength && `${med.strength} - `}
                                                {med.morning > 0 && `${med.morning} morning `}
                                                {med.afternoon > 0 && `${med.afternoon} afternoon `}
                                                {med.evening > 0 && `${med.evening} evening `}
                                                {med.night > 0 && `${med.night} night `}
                                                {med.duration > 0 && `for ${med.duration} days`}
                                            </div>
                                            {med.prescriptionId && (
                                                <Link to={`/prescriptions/${med.prescriptionId}`} style={{ fontSize: '13px', color: '#0066CC', marginTop: '8px', display: 'inline-block' }}>
                                                    View Prescription
                                                </Link>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ backgroundColor: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Active</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                                        <button 
                                            style={{ backgroundColor: '#EF4444', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer' }} 
                                            onClick={() => toggleStandaloneMedicine(med._id, med.isActive)}
                                        >
                                            Mark Inactive
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Prescription Medicines Section */}
                    {prescriptionMedicines.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: activeStandalone.length > 0 ? '24px' : '8px' }}>From Prescriptions</h3>
                            {prescriptionMedicines.map((med, idx) => (
                                <div key={`prescription-${idx}`} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '600' }}>{med.drugName}</div>
                                            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                                                {med.strength && `${med.strength} - `}
                                                {med.morning > 0 && `${med.morning} morning `}
                                                {med.afternoon > 0 && `${med.afternoon} afternoon `}
                                                {med.evening > 0 && `${med.evening} evening `}
                                                {med.night > 0 && `${med.night} night `}
                                                {med.duration > 0 && `for ${med.duration} days`}
                                            </div>
                                            <Link to={`/prescriptions/${med.prescriptionId}`} style={{ fontSize: '13px', color: '#0066CC', marginTop: '8px', display: 'inline-block' }}>
                                                Prescription: {med.prescriptionTitle} (Dr. {med.prescriptionDoctor})
                                            </Link>
                                        </div>
                                        <div>
                                            <span style={{ backgroundColor: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Active</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                                        <button 
                                            style={{ backgroundColor: '#EF4444', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer' }} 
                                            onClick={() => togglePrescriptionMedicine(med.prescriptionId, med.medicationIndex, true)}
                                        >
                                            Mark Inactive
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default ActiveMedicines;