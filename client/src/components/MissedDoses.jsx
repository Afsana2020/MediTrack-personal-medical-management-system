import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiInfo, FiFileText, FiAlertCircle } from 'react-icons/fi';

const MissedDoses = () => {
    const [missedDoses, setMissedDoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [medicineDetails, setMedicineDetails] = useState({});
    const [prescriptionDetails, setPrescriptionDetails] = useState({});

    useEffect(() => {
        loadMissedDoses();
    }, []);

    const loadMissedDoses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/missed-doses', {
                headers: { 'x-auth-token': token }
            });
            
            const grouped = {};
            response.data.forEach(dose => {
                const key = `${dose.medicineId}_${dose.timeSlot}`;
                if (!grouped[key]) {
                    grouped[key] = dose;
                }
            });
            
            const uniqueDoses = Object.values(grouped);
            setMissedDoses(uniqueDoses);
            await fetchMedicineAndPrescriptionDetails(uniqueDoses);
        } catch (error) {
            console.error('Error loading missed doses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicineAndPrescriptionDetails = async (doses) => {
        const token = localStorage.getItem('token');
        const medDetails = {};
        const presDetails = {};
        
        for (const dose of doses) {
            if (dose.medicineId && !medDetails[dose.medicineId]) {
                try {
                    const medRes = await axios.get(`http://localhost:5000/api/medicines/${dose.medicineId}`, {
                        headers: { 'x-auth-token': token }
                    });
                    const medicine = medRes.data;
                    medDetails[dose.medicineId] = medicine;
                    
                    if (medicine.prescriptionId && !presDetails[medicine.prescriptionId]) {
                        try {
                            const presRes = await axios.get(`http://localhost:5000/api/prescriptions/${medicine.prescriptionId}`, {
                                headers: { 'x-auth-token': token }
                            });
                            presDetails[medicine.prescriptionId] = presRes.data;
                        } catch (err) {
                            console.error('Error fetching prescription:', err);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching medicine:', err);
                }
            }
        }
        
        setMedicineDetails(medDetails);
        setPrescriptionDetails(presDetails);
    };

    const confirmTaken = async (id, drugName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/missed-doses/${id}/confirm-taken`, {}, {
                headers: { 'x-auth-token': token }
            });
            await loadMissedDoses();
            setMessage({ type: 'success', text: `${drugName} marked as taken` });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'danger', text: 'Failed to update' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const getTimeSlotLabel = (slot) => {
        const labels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };
        return labels[slot] || slot;
    };

    const getDoseQuantity = (medicineId, timeSlot) => {
        const medicine = medicineDetails[medicineId];
        if (!medicine) return 1;
        if (timeSlot === 'morning') return medicine.morning || 1;
        if (timeSlot === 'afternoon') return medicine.afternoon || 1;
        if (timeSlot === 'evening') return medicine.evening || 1;
        if (timeSlot === 'night') return medicine.night || 1;
        return 1;
    };

    const getWithFoodText = (medicineId) => {
        const medicine = medicineDetails[medicineId];
        if (!medicine) return '';
        const foodMap = {
            'no restriction': 'No restriction',
            'before food': 'Take before food',
            'after food': 'Take after food',
            'with food': 'Take with food',
            'empty stomach': 'Take on empty stomach'
        };
        return foodMap[medicine.timingWithFood] || '';
    };

    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh' },
        header: { marginBottom: '28px' },
        title: { fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' },
        subtitle: { fontSize: '14px', color: '#64748B' },
        statsCard: { background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', borderRadius: '24px', padding: '28px', marginBottom: '32px', textAlign: 'center', border: 'none' },
        statsNumber: { fontSize: '56px', fontWeight: '700', color: '#DC2626', lineHeight: 1 },
        statsLabel: { fontSize: '14px', color: '#991B1B', marginTop: '8px', fontWeight: '500' },
        missedCard: { border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', marginBottom: '20px', backgroundColor: '#FFFFFF', transition: 'box-shadow 0.2s' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
        drugName: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' },
        doseInfo: { fontSize: '14px', fontWeight: '500', color: '#DC2626', marginBottom: '8px' },
        missedDate: { fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
        divider: { height: '1px', backgroundColor: '#E2E8F0', margin: '16px 0' },
        infoRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '10px' },
        prescriptionLink: { color: '#0066CC', textDecoration: 'none', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' },
        timeSlotBadge: { backgroundColor: '#FEF3C7', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' },
        confirmButton: { backgroundColor: '#10B981', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '20px', transition: 'background-color 0.2s' },
        emptyState: { textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' },
        emptyStateIcon: { fontSize: '48px', marginBottom: '16px', color: '#94A3B8' },
        emptyStateText: { fontSize: '16px', color: '#64748B', marginBottom: '8px' },
        emptyStateSubtext: { fontSize: '13px', color: '#94A3B8' }
    };

    if (loading) {
        return (
            <Container fluid style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading missed doses...</div>
            </Container>
        );
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Missed Doses</h1>
                <p style={styles.subtitle}>Medications that were not marked as taken on time</p>
            </div>

            <div style={styles.statsCard}>
                <div style={styles.statsNumber}>{missedDoses.length}</div>
                <div style={styles.statsLabel}>Missed Doses</div>
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px', border: 'none', marginBottom: '20px' }}>{message.text}</Alert>}

            {missedDoses.length === 0 ? (
                <Card style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>
                        <FiCheckCircle size={48} color="#10B981" />
                    </div>
                    <div style={styles.emptyStateText}>No missed doses</div>
                    <div style={styles.emptyStateSubtext}>Good job staying on track with your medications</div>
                </Card>
            ) : (
                missedDoses.map(dose => {
                    const quantity = getDoseQuantity(dose.medicineId, dose.timeSlot);
                    const medicine = medicineDetails[dose.medicineId];
                    const prescription = prescriptionDetails[medicine?.prescriptionId];
                    const withFoodText = getWithFoodText(dose.medicineId);
                    
                    return (
                        <Card key={dose._id} style={styles.missedCard}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <div style={styles.drugName}>{dose.drugName}</div>
                                    <div style={styles.doseInfo}>
                                        Missed {quantity} {quantity === 1 ? 'tablet' : 'tablets'}
                                    </div>
                                    <div style={styles.missedDate}>
                                        <FiClock size={14} />
                                        {new Date(dose.expectedDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <Badge style={styles.timeSlotBadge}>
                                    {getTimeSlotLabel(dose.timeSlot)} Dose
                                </Badge>
                            </div>
                            
                            {medicine && (
                                <>
                                    <div style={styles.divider} />
                                    
                                    {withFoodText && (
                                        <div style={styles.infoRow}>
                                            <FiInfo size={14} />
                                            <span>{withFoodText}</span>
                                        </div>
                                    )}
                                    
                                    {medicine.specialInstructions && (
                                        <div style={styles.infoRow}>
                                            <FiInfo size={14} />
                                            <span>{medicine.specialInstructions}</span>
                                        </div>
                                    )}
                                    
                                    {medicine.duration > 0 && (
                                        <div style={styles.infoRow}>
                                            <span>Duration: {medicine.duration} days</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {prescription && (
                                <Link to={`/prescriptions/${prescription._id}`} style={styles.prescriptionLink}>
                                    <FiFileText size={14} /> View Prescription: {prescription.title || 'Untitled'}
                                </Link>
                            )}
                            
                            <button 
                                style={styles.confirmButton}
                                onClick={() => confirmTaken(dose._id, dose.drugName)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                            >
                                <FiCheckCircle size={18} /> I Actually Took This Dose
                            </button>
                        </Card>
                    );
                })
            )}
        </Container>
    );
};

export default MissedDoses;