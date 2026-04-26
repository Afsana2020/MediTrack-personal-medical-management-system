import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FiBell, FiAlertCircle, FiCalendar, FiClock, FiFileText, FiCheckCircle } from 'react-icons/fi';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isCaregiver, setIsCaregiver] = useState(false);

    useEffect(() => {
        loadUserRole();
    }, []);

    const loadUserRole = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setIsCaregiver(res.data.user.role === 'caregiver');
            loadNotifications(res.data.user.role === 'caregiver');
        } catch (error) {
            console.error('Error loading user role:', error);
            loadNotifications(false);
        }
    };

    const loadNotifications = async (caregiverMode) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = caregiverMode ? '/api/notifications/caregiver' : '/api/notifications';
            const response = await axios.get(`http://localhost:5000${endpoint}`, {
                headers: { 'x-auth-token': token }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            loadNotifications(isCaregiver);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                headers: { 'x-auth-token': token }
            });
            loadNotifications(isCaregiver);
            setMessage({ type: 'success', text: 'All notifications marked as read' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to mark all as read' });
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'medicine_inactive':
                return <FiCheckCircle size={16} />;
            case 'missed_dose':
                return <FiAlertCircle size={16} />;
            case 'missed_appointment':
                return <FiCalendar size={16} />;
            case 'appointment_reminder':
                return <FiClock size={16} />;
            case 'daily_summary':
                return <FiFileText size={16} />;
            default:
                return <FiBell size={16} />;
        }
    };

    const getTypeText = (type) => {
        const texts = {
            medicine_inactive: 'Medicine Inactive',
            missed_dose: 'Missed Dose',
            missed_appointment: 'Missed Appointment',
            medicine_expiring: 'Medicine Expiring',
            appointment_reminder: 'Appointment Reminder',
            daily_summary: 'Daily Summary'
        };
        return texts[type] || 'Notification';
    };

    const styles = {
        container: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
        title: { fontSize: '28px', fontWeight: '600', color: '#1E293B', margin: 0 },
        markAllButton: { backgroundColor: '#0066CC', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '14px' },
        notificationCard: { border: 'none', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', transition: 'transform 0.2s' },
        notificationUnread: { backgroundColor: '#EFF6FF', borderLeft: '4px solid #0066CC' },
        notificationRead: { backgroundColor: 'white', borderLeft: '4px solid #E2E8F0' },
        notificationBody: { padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
        notificationIcon: { color: '#0066CC', marginTop: '2px' },
        notificationContent: { flex: 1 },
        notificationTitle: { fontWeight: '600', marginBottom: '4px', fontSize: '15px' },
        notificationMessage: { color: '#64748B', fontSize: '13px', marginBottom: '8px' },
        notificationTime: { fontSize: '11px', color: '#94A3B8' },
        emptyState: { textAlign: 'center', padding: '60px', color: '#94A3B8' }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
    }

    return (
        <Container fluid style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Notifications</h1>
                {notifications.length > 0 && (
                    <Button style={styles.markAllButton} onClick={markAllAsRead}>Mark All as Read</Button>
                )}
            </div>

            {message && <Alert variant={message.type} style={{ borderRadius: '10px' }}>{message.text}</Alert>}

            {notifications.length === 0 ? (
                <div style={styles.emptyState}>
                    No notifications
                </div>
            ) : (
                notifications.map(notif => (
                    <Card
                        key={notif._id}
                        style={{
                            ...styles.notificationCard,
                            ...(notif.isRead ? styles.notificationRead : styles.notificationUnread)
                        }}
                        onClick={() => !notif.isRead && markAsRead(notif._id)}
                    >
                        <div style={styles.notificationBody}>
                            <div style={styles.notificationIcon}>
                                {getTypeIcon(notif.type)}
                            </div>
                            <div style={styles.notificationContent}>
                                <div style={styles.notificationTitle}>
                                    {getTypeText(notif.type)}
                                </div>
                                <div style={styles.notificationMessage}>{notif.message}</div>
                                <div style={styles.notificationTime}>
                                    {new Date(notif.createdAt).toLocaleString()}
                                    {!notif.isRead && <Badge bg="primary" style={{ marginLeft: '8px' }}>New</Badge>}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default Notifications;