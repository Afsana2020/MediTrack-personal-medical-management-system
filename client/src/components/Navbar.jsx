import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import axios from 'axios';
import { FiBell, FiUser, FiLogOut, FiHome, FiFileText, FiCalendar, FiActivity, FiAlertCircle, FiUsers } from 'react-icons/fi';

const NavigationBar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [unreadCount, setUnreadCount] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUserRole();
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUserRole = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setUserRole(res.data.user.role);
        } catch (error) {
            console.error('Error fetching user role:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications/unread-count', {
                headers: { 'x-auth-token': token }
            });
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

   const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

    const styles = {
        navbar: {
            backgroundColor: '#0066CC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '12px 0'
        },
        brand: {
            fontSize: '22px',
            fontWeight: '600',
            color: 'white',
            textDecoration: 'none',
            letterSpacing: '-0.3px'
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        dropdownToggle: {
            color: 'white',
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none'
        },
        dropdownItem: {
            color: '#1E293B',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
        },
        iconButton: {
            background: 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        },
        notificationIcon: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        badge: {
            position: 'absolute',
            top: '-8px',
            right: '-10px',
            backgroundColor: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold'
        },
        logoutButton: {
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            /* Make all dropdown toggles white */
            .navbar-nav .dropdown-toggle {
                color: white !important;
            }
            
            .navbar-nav .dropdown-toggle::after {
                color: white !important;
            }
            
            /* Fix dropdown menu position */
            .navbar-nav .dropdown-menu {
                margin-top: 8px !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                border: 1px solid #E2E8F0 !important;
            }
            
            /* Hover effect for nav links and dropdown toggles */
            .navbar-nav .nav-link:hover,
            .navbar-nav .dropdown-toggle:hover {
                background-color: rgba(255,255,255,0.1) !important;
                border-radius: 8px !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (!token) return null;

    if (loading) {
        return (
            <Navbar style={styles.navbar}>
                <Container>
                    <Navbar.Brand style={styles.brand}>MediTrack</Navbar.Brand>
                </Container>
            </Navbar>
        );
    }

    return (
        <Navbar style={styles.navbar} expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/" style={styles.brand}>
                    MediTrack
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {userRole === 'patient' && (
                            <>
                                <Nav.Link as={Link} to="/" style={styles.navLink}>
                                    <FiHome size={16} /> Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/prescriptions" style={styles.navLink}>
                                    <FiFileText size={16} /> Prescriptions
                                </Nav.Link>
                                <Nav.Link as={Link} to="/appointments" style={styles.navLink}>
                                    <FiCalendar size={16} /> Appointments
                                </Nav.Link>
                                <Nav.Link as={Link} to="/symptoms" style={styles.navLink}>
                                    <FiActivity size={16} /> Symptoms
                                </Nav.Link>
                                
                                <NavDropdown 
                                    title={
                                        <>
                                            <FiAlertCircle size={16} /> Tracking
                                        </>
                                    }
                                    id="tracking-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/medicines" style={styles.dropdownItem}>
                                        <FiFileText size={14} /> Medicines
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/missed-doses" style={styles.dropdownItem}>
                                        <FiAlertCircle size={14} /> Missed Doses
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/missed-appointments" style={styles.dropdownItem}>
                                        <FiCalendar size={14} /> Missed Appointments
                                    </NavDropdown.Item>
                                    
                                    
                                </NavDropdown>
                            </>
                        )}

                        {userRole === 'caregiver' && (
                            <>
                                <Nav.Link as={Link} to="/" style={styles.navLink}>
                                    <FiHome size={16} /> Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/daily-summary" style={styles.navLink}>
                                    <FiCalendar size={16} /> Daily Summary
                                </Nav.Link>
                                <Nav.Link as={Link} to="/caregiver-profile" style={styles.navLink}>
                                    <FiUsers size={16} /> My Patients
                                </Nav.Link>
                            </>
                        )}
                    </Nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to="/notifications" style={styles.iconButton}>
                            <div style={styles.notificationIcon}>
                                <FiBell size={20} />
                                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
                            </div>
                        </Link>
                        <Link to="/profile" style={styles.iconButton}>
                            <FiUser size={20} />
                        </Link>
                        <Button onClick={handleLogout} style={styles.logoutButton}>
                            <FiLogOut size={16} /> Logout
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;