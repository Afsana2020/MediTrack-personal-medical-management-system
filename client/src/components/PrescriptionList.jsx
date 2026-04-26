import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrescriptions, deletePrescription } from '../services/api';
import { Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicinesCount, setMedicinesCount] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        const res = await getPrescriptions();
        setPrescriptions(res.data);
        
        const token = localStorage.getItem('token');
        const counts = {};
        for (const prescription of res.data) {
            try {
                const medRes = await axios.get(`http://localhost:5000/api/medicines/prescription/${prescription._id}`, {
                    headers: { 'x-auth-token': token }
                });
                counts[prescription._id] = medRes.data.length;
            } catch (error) {
                counts[prescription._id] = 0;
            }
        }
        setMedicinesCount(counts);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this prescription? This will also delete all linked medicines.')) {
            await deletePrescription(id);
            loadPrescriptions();
            setMessage({ type: 'success', text: 'Prescription deleted' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const styles = {
        container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', margin: 0 },
        newButton: { backgroundColor: '#0066CC', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '500' },
        card: { border: 'none', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
        table: { width: '100%', borderCollapse: 'collapse' },
        tableHeader: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        headerCell: { padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px' },
        cell: { padding: '16px', verticalAlign: 'top' },
        actionCell: { padding: '16px', textAlign: 'center', verticalAlign: 'top' },
        viewButton: { backgroundColor: '#0066CC', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px', marginRight: '8px' },
        editButton: { backgroundColor: '#F59E0B', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px', marginRight: '8px', color: 'white' },
        deleteButton: { backgroundColor: '#EF4444', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '6px' },
        diagnosis: { fontSize: '12px', color: '#64748B', marginTop: '4px' },
        doctorName: { fontWeight: '500', color: '#1E293B', fontSize: '14px' },
        doctorSpecialty: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
        date: { fontSize: '13px', color: '#475569' },
        badgeActive: { backgroundColor: '#10B981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block' },
        badgeInactive: { backgroundColor: '#94A3B8', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block' },
        medicinesBadge: { backgroundColor: '#EFF6FF', color: '#0066CC', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', display: 'inline-block', marginTop: '6px' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8' },
        row: { borderBottom: '1px solid #E2E8F0' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Prescriptions</h1>
                <Link to="/add_prescription">
                    <Button style={styles.newButton}>+ New Prescription</Button>
                </Link>
            </div>
            
            {message && <Alert variant={message.type} style={{ borderRadius: '10px' }}>{message.text}</Alert>}
            
            <Card style={styles.card}>
                <Card.Body style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.headerCell}>Title / Diagnosis</th>
                                    <th style={styles.headerCell}>Doctor</th>
                                    <th style={styles.headerCell}>Date</th>
                                    <th style={styles.headerCell}>Medicines</th>
                                    <th style={styles.headerCell}>Status</th>
                                    <th style={styles.headerCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={styles.emptyState}>No prescriptions found</td>
                                    </tr>
                                ) : (
                                    prescriptions.map(p => (
                                        <tr key={p._id} style={styles.row}>
                                            <td style={styles.cell}>
                                                <div style={{ fontWeight: '500', color: '#1E293B' }}>{p.title || 'Untitled'}</div>
                                                {p.diagnosis && <div style={styles.diagnosis}>{p.diagnosis}</div>}
                                            </td>
                                            <td style={styles.cell}>
                                                <div style={styles.doctorName}>Dr. {p.doctorName || 'Unknown'}</div>
                                                {p.doctorSpecialty && <div style={styles.doctorSpecialty}>{p.doctorSpecialty}</div>}
                                            </td>
                                            <td style={styles.cell}>
                                                <span style={styles.date}>{new Date(p.prescriptionDate).toLocaleDateString()}</span>
                                            </td>
                                            <td style={styles.cell}>
                                                <span style={styles.medicinesBadge}>
                                                    {medicinesCount[p._id] || 0} medicine(s)
                                                </span>
                                            </td>
                                            <td style={styles.cell}>
                                                <span style={p.isActive ? styles.badgeActive : styles.badgeInactive}>
                                                    {p.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={styles.actionCell}>
                                                <Link to={`/prescriptions/${p._id}`}>
                                                    <Button size="sm" style={styles.viewButton}>View</Button>
                                                </Link>
                                                <Link to={`/edit_prescription/${p._id}`}>
                                                    <Button size="sm" style={styles.editButton}>Edit</Button>
                                                </Link>
                                                <Button size="sm" style={styles.deleteButton} onClick={() => handleDelete(p._id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PrescriptionList;