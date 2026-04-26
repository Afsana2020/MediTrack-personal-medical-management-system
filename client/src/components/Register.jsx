import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const appDiv = document.querySelector('.App');
        if (appDiv) {
            appDiv.style.padding = '0';
            appDiv.style.margin = '0';
            appDiv.style.height = '100vh';
            appDiv.style.overflow = 'hidden';
        }
        return () => {
            if (appDiv) {
                appDiv.style.padding = '';
                appDiv.style.margin = '';
                appDiv.style.height = '';
                appDiv.style.overflow = '';
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const res = await register({ name, email, password, role });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            zIndex: 9999,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            overflow: 'hidden'
        }}>
            <div style={{ 
                background: '#0066CC', 
                padding: '12px 48px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexShrink: 0
            }}>
                <Link to="/" style={{ 
                    color: 'white', 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    textDecoration: 'none'
                }}>MediTrack</Link>
                <div style={{ display: 'flex', gap: '28px' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Home</Link>
                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>About</Link>
                    <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Contact</Link>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1.2, position: 'relative', background: '#0066CC' }}>
                    <img 
                        src="/images/register_ui.jpg" 
                        alt="Medical care"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        padding: '40px 40px 30px 40px'
                    }}>
                        <div style={{ maxWidth: '350px' }}>
                            <h2 style={{ 
                                color: 'white', 
                                fontSize: '28px', 
                                fontWeight: '700', 
                                margin: '0 0 12px 0',
                                lineHeight: '1.2'
                            }}>
                                Start Your<br />Health Journey
                            </h2>
                            <p style={{ 
                                color: 'rgba(255,255,255,0.9)', 
                                fontSize: '13px', 
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                Join thousands of patients managing their health with MediTrack.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'white', 
                    padding: '20px 40px',
                    overflow: 'hidden'
                }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        {/* Logo */}
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            color: '#0066CC', 
                            marginBottom: '16px'
                        }}>MediTrack</div>
                        
                        {/* Welcome Text */}
                        <h1 style={{ 
                            fontSize: '26px', 
                            fontWeight: '700', 
                            margin: '0 0 4px 0', 
                            color: '#0F172A'
                        }}>Create account</h1>
                       
                        
                        {error && <Alert variant="danger" style={{ borderRadius: '8px', marginBottom: '12px', padding: '6px 10px', fontSize: '11px' }}>{error}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-2">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '11px', 
                                    marginBottom: '3px', 
                                    color: '#334155'
                                }}>Full Name</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        style={{ 
                                            padding: '7px 10px 7px 32px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-2">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '11px', 
                                    marginBottom: '3px', 
                                    color: '#334155'
                                }}>Email</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter an email address"
                                        style={{ 
                                            padding: '7px 10px 7px 32px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-2">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '11px', 
                                    marginBottom: '3px', 
                                    color: '#334155'
                                }}>Password</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create password"
                                        style={{ 
                                            padding: '7px 10px 7px 32px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-2">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '11px', 
                                    marginBottom: '3px', 
                                    color: '#334155'
                                }}>Confirm Password</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        style={{ 
                                            padding: '7px 10px 7px 32px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '12px'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-2">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '11px', 
                                    marginBottom: '3px', 
                                    color: '#334155'
                                }}>Account Type</Form.Label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div 
                                        onClick={() => setRole('patient')}
                                        style={{
                                            flex: 1,
                                            padding: '7px',
                                            border: `2px solid ${role === 'patient' ? '#0066CC' : '#E2E8F0'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: role === 'patient' ? '#F0F9FF' : 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '11px', color: '#1E293B' }}>Patient</div>
                                        <div style={{ fontSize: '9px', color: '#64748B' }}>Manage health</div>
                                    </div>
                                    <div 
                                        onClick={() => setRole('caregiver')}
                                        style={{
                                            flex: 1,
                                            padding: '7px',
                                            border: `2px solid ${role === 'caregiver' ? '#0066CC' : '#E2E8F0'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: role === 'caregiver' ? '#F0F9FF' : 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '11px', color: '#1E293B' }}>Caregiver</div>
                                        <div style={{ fontSize: '9px', color: '#64748B' }}>Monitor family</div>
                                    </div>
                                </div>
                            </Form.Group>
                            
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                style={{ 
                                    width: '100%', 
                                    background: '#0066CC', 
                                    border: 'none', 
                                    padding: '8px', 
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    marginTop: '4px'
                                }}
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                                {!loading && <FiArrowRight size={12} />}
                            </Button>
                        </Form>
                        
                        
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: '14px', 
                            paddingTop: '10px', 
                            borderTop: '1px solid #E2E8F0'
                        }}>
                            <span style={{ color: '#64748B', fontSize: '11px' }}>Already have an account? </span>
                            <Link to="/login" style={{ 
                                color: '#0066CC', 
                                textDecoration: 'none', 
                                fontSize: '11px', 
                                fontWeight: '600'
                            }}>Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;