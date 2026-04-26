import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';

const PatientProfile = () => {
    const [user, setUser] = useState(null);
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState({ allergen: '', reaction: '', severity: 'moderate' });
    const [linkedCaregivers, setLinkedCaregivers] = useState([]);
    const [allCaregivers, setAllCaregivers] = useState([]);
    const [selectedCaregiver, setSelectedCaregiver] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
        loadAllCaregivers();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setUser(userRes.data.user);
            setAllergies(userRes.data.user.allergies || []);
            
            const caregiverRes = await axios.get('http://localhost:5000/api/caregiver/links', {
                headers: { 'x-auth-token': token }
            });
            setLinkedCaregivers(caregiverRes.data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllCaregivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/caregiver/all', {
                headers: { 'x-auth-token': token }
            });
            setAllCaregivers(response.data);
        } catch (error) {
            console.error('Error loading caregivers:', error);
        }
    };

    const handleAddAllergy = async (e) => {
        e.preventDefault();
        if (!newAllergy.allergen) return;
        
        try {
            const token = localStorage.getItem('token');
            const updatedAllergies = [...allergies, newAllergy];
            await axios.put('http://localhost:5000/api/users/allergies', 
                { allergies: updatedAllergies },
                { headers: { 'x-auth-token': token } }
            );
            setAllergies(updatedAllergies);
            setNewAllergy({ allergen: '', reaction: '', severity: 'moderate' });
            setMessage({ type: 'success', text: 'Allergy added successfully' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to add allergy' });
        }
    };

    const handleRemoveAllergy = async (index) => {
        const updatedAllergies = allergies.filter((_, i) => i !== index);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/allergies', 
                { allergies: updatedAllergies },
                { headers: { 'x-auth-token': token } }
            );
            setAllergies(updatedAllergies);
            setMessage({ type: 'success', text: 'Allergy removed' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to remove allergy' });
        }
    };

    const handleAddCaregiver = async (e) => {
        e.preventDefault();
        if (!selectedCaregiver) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/caregiver/link', {
                caregiverEmail: selectedCaregiver.email,
                caregiverName: selectedCaregiver.name
            }, { headers: { 'x-auth-token': token } });
            
            setSelectedCaregiver(null);
            loadProfile();
            setMessage({ type: 'success', text: 'Caregiver linked successfully' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to link caregiver' });
        }
    };

    const handleRemoveCaregiver = async (caregiverId) => {
        if (window.confirm('Remove this caregiver?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/caregiver/links/${caregiverId}`, {
                    headers: { 'x-auth-token': token }
                });
                loadProfile();
                setMessage({ type: 'success', text: 'Caregiver removed' });
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Failed to remove caregiver' });
            }
        }
    };

    const availableCaregivers = allCaregivers.filter(cg => 
        !linkedCaregivers.some(linked => linked.caregiverEmail === cg.email)
    );

    const caregiverOptions = availableCaregivers.map(cg => ({
        value: cg.email,
        label: `${cg.name} (${cg.email})`,
        email: cg.email,
        name: cg.name
    }));

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            padding: '4px',
            borderColor: '#E2E8F0',
            borderRadius: '10px',
            boxShadow: 'none',
            '&:hover': { borderColor: '#0066CC' }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#EFF6FF' : 'white',
            color: '#1E293B',
            cursor: 'pointer',
            padding: '10px 12px'
        }),
        menu: (base) => ({
            ...base,
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 9999
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '250px',
            overflowY: 'auto'
        })
    };

    const styles = {
        container: { 
            maxWidth: '1000px', 
            margin: '0 auto', 
            padding: '20px',
            paddingBottom: '40px'
        },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', marginBottom: '20px', letterSpacing: '-0.3px' },
        card: { border: 'none', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', marginBottom: '20px', overflow: 'visible' },
        cardHeader: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 20px' },
        cardHeaderTitle: { fontSize: '16px', fontWeight: '600', color: '#1E293B', margin: 0 },
        cardBody: { padding: '20px' },
        infoRow: { display: 'flex', marginBottom: '14px', flexWrap: 'wrap', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' },
        label: { width: '140px', fontWeight: '500', color: '#64748B', fontSize: '14px' },
        value: { flex: 1, color: '#1E293B', fontSize: '14px', fontWeight: '500' },
        sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '14px', paddingBottom: '6px', borderBottom: '2px solid #0066CC', display: 'inline-block' },
        
        scrollableAllergies: {
            maxHeight: '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: '20px',
            paddingRight: '6px'
        },
        scrollableCaregivers: {
            maxHeight: '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: '20px',
            paddingRight: '6px'
        },
        
        allergyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '10px', border: '1px solid #E2E8F0' },
        caregiverItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '10px', border: '1px solid #E2E8F0' },
        allergyName: { fontWeight: '600', color: '#1E293B', fontSize: '14px' },
        allergyReaction: { fontSize: '12px', color: '#64748B', marginTop: '3px' },
        severityBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', marginLeft: '8px' },
        severityMild: { backgroundColor: '#D1FAE5', color: '#065F46' },
        severityModerate: { backgroundColor: '#FEF3C7', color: '#92400E' },
        severitySevere: { backgroundColor: '#FEE2E2', color: '#991B1B' },
        caregiverName: { fontWeight: '600', color: '#1E293B', fontSize: '14px' },
        caregiverEmail: { fontSize: '12px', color: '#64748B', marginTop: '2px' },
        removeButton: { 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0', 
            color: '#EF4444', 
            padding: '4px 12px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: '500', 
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '70px'
        },
        addButton: { backgroundColor: '#0066CC', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: 'white', cursor: 'pointer', marginTop: '6px', transition: 'all 0.2s' },
        input: { width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF' },
        select: { width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF' },
        emptyState: { textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '13px' },
        formLabel: { fontWeight: '500', fontSize: '13px', color: '#334155', marginBottom: '4px', display: 'block' },
        formGroup: { marginBottom: '12px' },
        
        scrollbarStyles: {
            '&::-webkit-scrollbar': {
                width: '4px'
            },
            '&::-webkit-scrollbar-track': {
                background: '#F1F5F9',
                borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#CBD5E1',
                borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: '#94A3B8'
            }
        }
    };

    const getSeverityStyle = (severity) => {
        if (severity === 'mild') return { ...styles.severityBadge, ...styles.severityMild };
        if (severity === 'moderate') return { ...styles.severityBadge, ...styles.severityModerate };
        return { ...styles.severityBadge, ...styles.severitySevere };
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>Loading profile information...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <h1 style={styles.title}>My Profile</h1>

            {message && <Alert variant={message.type} style={{ borderRadius: '12px', marginBottom: '16px' }}>{message.text}</Alert>}

            <Card style={styles.card}>
                <div style={styles.cardHeader}>
                    <h5 style={styles.cardHeaderTitle}>Personal Information</h5>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Full Name</div>
                        <div style={styles.value}>{user?.name}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Email Address</div>
                        <div style={styles.value}>{user?.email}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Account Type</div>
                        <div style={styles.value}>{user?.role === 'patient' ? 'Patient' : 'Caregiver'}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.label}>Member Since</div>
                        <div style={styles.value}>{new Date(user?.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            </Card>

            {user?.role === 'patient' && (
                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Allergies & Medical Notes</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <div style={styles.sectionTitle}>Recorded Allergies ({allergies.length})</div>
                        <div style={styles.scrollableAllergies}>
                            {allergies.length === 0 ? (
                                <div style={styles.emptyState}>No allergies recorded</div>
                            ) : (
                                allergies.map((a, idx) => (
                                    <div key={idx} style={styles.allergyItem}>
                                        <div>
                                            <span style={styles.allergyName}>{a.allergen}</span>
                                            {a.reaction && <span style={styles.allergyReaction}> - {a.reaction}</span>}
                                            <span style={getSeverityStyle(a.severity)}>
                                                {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                                            </span>
                                        </div>
                                        <button
                                            style={styles.removeButton}
                                            onClick={() => handleRemoveAllergy(idx)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div style={styles.sectionTitle} className="mt-3">Add New Allergy</div>
                        <Form onSubmit={handleAddAllergy}>
                            <Row>
                                <Col md={5}>
                                    <Form.Group className="mb-2" style={styles.formGroup}>
                                        <Form.Label style={styles.formLabel}>Allergen</Form.Label>
                                        <Form.Control 
                                            type="text"
                                            placeholder="e.g., Penicillin, Peanuts"
                                            value={newAllergy.allergen} 
                                            onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})} 
                                            style={styles.input}
                                            required 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2" style={styles.formGroup}>
                                        <Form.Label style={styles.formLabel}>Reaction</Form.Label>
                                        <Form.Control 
                                            type="text"
                                            placeholder="e.g., Rash, Swelling"
                                            value={newAllergy.reaction} 
                                            onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})} 
                                            style={styles.input}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-2" style={styles.formGroup}>
                                        <Form.Label style={styles.formLabel}>Severity</Form.Label>
                                        <Form.Select 
                                            value={newAllergy.severity} 
                                            onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                                            style={styles.select}
                                        >
                                            <option value="mild">Mild</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="severe">Severe</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button type="submit" style={styles.addButton}>Add Allergy</Button>
                        </Form>
                    </div>
                </Card>
            )}

            {user?.role === 'patient' && (
                <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h5 style={styles.cardHeaderTitle}>Caregiver Management</h5>
                    </div>
                    <div style={styles.cardBody}>
                        <div style={styles.sectionTitle}>Linked Caregivers ({linkedCaregivers.length})</div>
                        <div style={styles.scrollableCaregivers}>
                            {linkedCaregivers.length === 0 ? (
                                <div style={styles.emptyState}>No caregivers linked</div>
                            ) : (
                                linkedCaregivers.map(cg => (
                                    <div key={cg._id} style={styles.caregiverItem}>
                                        <div>
                                            <div style={styles.caregiverName}>{cg.caregiverName}</div>
                                            <div style={styles.caregiverEmail}>{cg.caregiverEmail}</div>
                                        </div>
                                        <button
                                            style={styles.removeButton}
                                            onClick={() => handleRemoveCaregiver(cg._id)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div style={styles.sectionTitle} className="mt-3">Add New Caregiver</div>
                        <Form onSubmit={handleAddCaregiver}>
                            <Form.Group className="mb-2" style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>Search Caregiver</Form.Label>
                                <Select
                                    options={caregiverOptions}
                                    value={selectedCaregiver ? {
                                        value: selectedCaregiver.email,
                                        label: `${selectedCaregiver.name} (${selectedCaregiver.email})`
                                    } : null}
                                    onChange={(option) => {
                                        if (option) {
                                            setSelectedCaregiver({
                                                email: option.email,
                                                name: option.name
                                            });
                                        } else {
                                            setSelectedCaregiver(null);
                                        }
                                    }}
                                    placeholder="Type to search for a caregiver..."
                                    isClearable
                                    styles={customSelectStyles}
                                    noOptionsMessage={() => "No caregivers found"}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                                    Search by name or email. Only registered caregivers appear here.
                                </Form.Text>
                            </Form.Group>
                            <Button 
                                type="submit" 
                                style={{ ...styles.addButton, opacity: selectedCaregiver ? 1 : 0.5 }}
                                disabled={!selectedCaregiver}
                            >
                                Add Caregiver
                            </Button>
                        </Form>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default PatientProfile;