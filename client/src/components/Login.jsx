import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        setLoading(true);
        setError('');
        try {
            const res = await login({ email, password });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Navbar */}
            <div style={{ 
                background: '#0066CC', 
                padding: '16px 48px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <Link to="/" style={{ 
                    color: 'white', 
                    fontSize: '22px', 
                    fontWeight: '700', 
                    textDecoration: 'none',
                    letterSpacing: '-0.3px'
                }}>MediTrack</Link>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500', opacity: '0.9' }}>Home</Link>
                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500', opacity: '0.9' }}>About</Link>
                    <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500', opacity: '0.9' }}>Contact</Link>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1.2, position: 'relative', background: '#0066CC' }}>
                    <img 
                        src="/images/login_ui.jpg" 
                        alt="Medical consultation"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        padding: '60px 48px 48px 48px'
                    }}>
                        <div style={{
                            maxWidth: '400px'
                        }}>
                            <h2 style={{ 
                                color: 'white', 
                                fontSize: '32px', 
                                fontWeight: '700', 
                                margin: '0 0 16px 0',
                                lineHeight: '1.2'
                            }}>
                                Your Health,<br />Our Priority
                            </h2>
                            <p style={{ 
                                color: 'rgba(255,255,255,0.9)', 
                                fontSize: '15px', 
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                Access your medications, track appointments, and manage your health records securely.
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
                    padding: '48px',
                    overflow: 'auto'
                }}>
                    <div style={{ width: '100%', maxWidth: '420px' }}>
                        {/* Logo */}
                        <div style={{ 
                            fontSize: '28px', 
                            fontWeight: '700', 
                            color: '#0066CC', 
                            marginBottom: '48px',
                            letterSpacing: '-0.5px'
                        }}>MediTrack</div>
                        
                       
                        <h1 style={{ 
                            fontSize: '36px', 
                            fontWeight: '700', 
                            margin: '0 0 12px 0', 
                            color: '#0F172A',
                            letterSpacing: '-0.02em'
                        }}>Welcome back</h1>
                        
                        
                        {error && <Alert variant="danger" style={{ borderRadius: '12px', marginBottom: '24px', border: 'none', background: '#FEF2F2', color: '#991B1B' }}>{error}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '13px', 
                                    marginBottom: '8px', 
                                    color: '#334155',
                                    display: 'block'
                                }}>Email Address</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        style={{ 
                                            padding: '12px 14px 12px 42px', 
                                            borderRadius: '12px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-4">
                                <Form.Label style={{ 
                                    fontWeight: '600', 
                                    fontSize: '13px', 
                                    marginBottom: '8px', 
                                    color: '#334155',
                                    display: 'block'
                                }}>Password</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        style={{ 
                                            padding: '12px 14px 12px 42px', 
                                            borderRadius: '12px', 
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                        required
                                    />
                                </div>
                            </Form.Group>
                            
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                style={{ 
                                    width: '100%', 
                                    background: '#0066CC', 
                                    border: 'none', 
                                    padding: '14px', 
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#0052A3'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#0066CC'}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <FiArrowRight size={16} />}
                            </Button>
                        </Form>
                        
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: '32px', 
                            paddingTop: '24px', 
                            borderTop: '1px solid #E2E8F0'
                        }}>
                            <span style={{ color: '#64748B', fontSize: '14px' }}>Don't have an account? </span>
                            <Link to="/register" style={{ 
                                color: '#0066CC', 
                                textDecoration: 'none', 
                                fontSize: '14px', 
                                fontWeight: '600'
                            }}>Create account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;