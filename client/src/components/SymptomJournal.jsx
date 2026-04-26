import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSymptoms, addSymptom, deleteSymptom, getAppointments } from '../services/api';
import { Table, Button, Modal, Form, Alert, Card, Badge } from 'react-bootstrap';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiCalendar, FiClock, FiActivity } from 'react-icons/fi';

const SymptomJournal = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ 
        symptom: '', severity: 'mild', duration: '', date: new Date().toISOString().split('T')[0], 
        time: '', notes: '', appointmentId: '', appointmentTitle: '' 
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const symRes = await getSymptoms();
        setSymptoms(symRes.data);
        const aptRes = await getAppointments();
        setAppointments(aptRes.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addSymptom(formData);
            setShowModal(false);
            setFormData({ symptom: '', severity: 'mild', duration: '', date: new Date().toISOString().split('T')[0], time: '', notes: '', appointmentId: '', appointmentTitle: '' });
            loadData();
            setMessage({ type: 'success', text: 'Symptom logged' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to log' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this symptom?')) {
            await deleteSymptom(id);
            loadData();
            setMessage({ type: 'success', text: 'Symptom deleted' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const getSeverityBadge = (severity) => {
        const variants = { 
            mild: { bg: '#D1FAE5', color: '#059669', label: 'Mild' },
            moderate: { bg: '#FEF3C7', color: '#D97706', label: 'Moderate' },
            severe: { bg: '#FEF2F2', color: '#DC2626', label: 'Severe' }
        };
        const v = variants[severity] || variants.mild;
        
        return <span style={{ 
            backgroundColor: v.bg, 
            color: v.color, 
            padding: '4px 0', 
            width: '80px',
            textAlign: 'center',
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '500', 
            display: 'inline-block' 
        }}>{v.label}</span>;
    };

    const styles = {
        container: { 
            maxWidth: '1200px', 
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
            marginBottom: '28px', 
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
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '500',
            fontSize: '14px'
        },
        card: { 
            border: 'none', 
            borderRadius: '20px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
        },
        table: { 
            width: '100%', 
            borderCollapse: 'collapse' 
        },
        tableHeader: { 
            backgroundColor: '#F8FAFC', 
            borderBottom: '1px solid #E2E8F0' 
        },
        headerCell: { 
            padding: '16px 20px', 
            textAlign: 'left', 
            color: '#64748B', 
            fontWeight: '600', 
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        cell: { 
            padding: '16px 20px', 
            verticalAlign: 'middle',
            fontSize: '14px',
            color: '#1E293B',
            borderBottom: '1px solid #F1F5F9'
        },
        actionCell: { 
            padding: '16px 20px', 
            verticalAlign: 'middle',
            borderBottom: '1px solid #F1F5F9'
        },
        actionGroup: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
        },
        actionButton: {
            width: '72px',
            padding: '6px 0',
            fontSize: '12px',
            borderRadius: '8px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none'
        },
        viewButton: {
            backgroundColor: '#EFF6FF',
            color: '#0066CC'
        },
        editButton: {
            backgroundColor: '#FEF3C7',
            color: '#D97706'
        },
        deleteButton: {
            backgroundColor: '#FEF2F2',
            color: '#DC2626'
        },
        emptyState: { 
            textAlign: 'center', 
            padding: '60px', 
            color: '#94A3B8' 
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
            backgroundColor: '#F8FAFC'
        },
        formLabel: {
            fontWeight: '600',
            fontSize: '13px',
            color: '#334155',
            marginBottom: '6px',
            display: 'block'
        },
        formControl: {
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '14px',
            width: '100%'
        },
        linkStyle: {
            color: '#0066CC',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '500'
        },
        symptomName: {
            fontWeight: '600',
            color: '#0F172A'
        },
        dateText: {
            fontSize: '13px',
            fontWeight: '500',
            color: '#1E293B'
        },
        timeText: {
            fontSize: '11px',
            color: '#64748B',
            marginTop: '2px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Symptom Journal</h1>
                <Button style={styles.addButton} onClick={() => setShowModal(true)}>
                    <FiPlus size={16} /> Log Symptom
                </Button>
            </div>
            
            {message && <Alert variant={message.type} style={{ borderRadius: '12px', marginBottom: '20px', border: 'none' }}>{message.text}</Alert>}
            
            <Card style={styles.card}>
                <Card.Body style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.headerCell}>Symptom</th>
                                    <th style={styles.headerCell}>Severity</th>
                                    <th style={styles.headerCell}>Duration</th>
                                    <th style={styles.headerCell}>Date & Time</th>
                                    <th style={styles.headerCell}>Linked To</th>
                                    <th style={styles.headerCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {symptoms.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={styles.emptyState}>
                                            <FiActivity size={48} style={{ marginBottom: '16px', color: '#CBD5E1' }} />
                                            <p>No symptoms logged yet</p>
                                            <Button style={styles.addButton} onClick={() => setShowModal(true)}>Log your first symptom</Button>
                                        </td>
                                    </tr>
                                ) : (
                                    symptoms.map(s => (
                                        <tr key={s._id}>
                                            <td style={styles.cell}>
                                                <span style={styles.symptomName}>{s.symptom}</span>
                                            </td>
                                            <td style={styles.cell}>
                                                {getSeverityBadge(s.severity)}
                                            </td>
                                            <td style={styles.cell}>
                                                {s.duration || '-'}
                                            </td>
                                            <td style={styles.cell}>
                                                <div style={styles.dateText}>
                                                    <FiCalendar size={11} style={{ marginRight: '4px', display: 'inline' }} />
                                                    {new Date(s.date).toLocaleDateString()}
                                                </div>
                                                {s.time && (
                                                    <div style={styles.timeText}>
                                                        <FiClock size={10} style={{ marginRight: '4px', display: 'inline' }} />
                                                        {s.time}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={styles.cell}>
                                                {s.appointmentTitle ? (
                                                    <Link to={`/appointments/${s.appointmentId}`} style={styles.linkStyle}>
                                                        {s.appointmentTitle}
                                                    </Link>
                                                ) : '-'}
                                            </td>
                                            <td style={styles.actionCell}>
                                                <div style={styles.actionGroup}>
                                                    <Link to={`/symptoms/${s._id}`} style={{ ...styles.actionButton, ...styles.viewButton }}>
                                                        <FiEye size={12} /> View
                                                    </Link>
                                                    <Link to={`/edit_symptom/${s._id}`} style={{ ...styles.actionButton, ...styles.editButton }}>
                                                        <FiEdit size={12} /> Edit
                                                    </Link>
                                                    <button 
                                                        style={{ ...styles.actionButton, ...styles.deleteButton, fontFamily: 'inherit' }}
                                                        onClick={() => handleDelete(s._id)}
                                                    >
                                                        <FiTrash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add Symptom */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton style={styles.modalHeader}>
                    <Modal.Title style={{ fontSize: '20px', fontWeight: '600' }}>Log Symptom</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body style={styles.modalBody}>
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Symptom</Form.Label>
                            <Form.Control 
                                required 
                                value={formData.symptom} 
                                onChange={(e) => setFormData({...formData, symptom: e.target.value})}
                                placeholder="e.g., Headache, Fever, Fatigue"
                                style={styles.formControl}
                            />
                        </Form.Group>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>Severity</Form.Label>
                                <Form.Select 
                                    value={formData.severity} 
                                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                    style={styles.formControl}
                                >
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>Duration</Form.Label>
                                <Form.Control 
                                    value={formData.duration} 
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                                    placeholder="e.g., 2 days"
                                    style={styles.formControl}
                                />
                            </Form.Group>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>Date</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    value={formData.date} 
                                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                    required
                                    style={styles.formControl}
                                />
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label style={styles.formLabel}>Time</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    value={formData.time} 
                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    style={styles.formControl}
                                />
                            </Form.Group>
                        </div>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Link to Appointment (Optional)</Form.Label>
                            <Form.Select 
                                value={formData.appointmentId} 
                                onChange={(e) => {
                                    const aptId = e.target.value;
                                    const apt = appointments.find(a => a._id === aptId);
                                    setFormData({...formData, appointmentId: aptId, appointmentTitle: apt ? `Dr. ${apt.doctorName} on ${new Date(apt.date).toLocaleDateString()}` : ''});
                                }}
                                style={styles.formControl}
                            >
                                <option value="">None</option>
                                {appointments.map(a => (
                                    <option key={a._id} value={a._id}>
                                        Dr. {a.doctorName} - {new Date(a.date).toLocaleDateString()}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label style={styles.formLabel}>Notes</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={formData.notes} 
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Additional details about your symptom..."
                                style={{ ...styles.formControl, resize: 'vertical' }}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={styles.modalFooter}>
                        <Button variant="secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Cancel</Button>
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0066CC', border: 'none', borderRadius: '10px' }}>Save Symptom</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default SymptomJournal;