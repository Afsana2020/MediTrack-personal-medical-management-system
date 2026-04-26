import React from 'react';
import { Container } from 'react-bootstrap';
import { MdEmail } from 'react-icons/md';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const token = localStorage.getItem('token');

    const styles = {
        footer: {
            backgroundColor: '#0066CC', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '0px 0', 
            marginTop: 'auto',
            width: '100%'
        },
        text: {
            color: 'rgba(255,255,255,0.85)',
            fontSize: '12px',
            textAlign: 'center',
            margin: '4px 0'
        },
        contactRow: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            margin: '6px 0',
            flexWrap: 'wrap'
        },
        link: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        },
        divider: {
            color: 'rgba(255,255,255,0.5)'
        }
    };

    if (!token) return null;

    return (
        <footer style={styles.footer}>
            <Container>
               
                
                <div style={styles.contactRow}>
                    <a href="mailto:afsanahena24@gmail.com" style={styles.link}>
                        <MdEmail size={14} />
                    </a>

                    <span style={styles.divider}>|</span>

                    <a href="https://github.com/Afsana2020" style={styles.link}>
                        <FaGithub size={14} />
                    </a>

                    <span style={styles.divider}>|</span>

                    <a href="https://www.linkedin.com/in/afsana-hena/" style={styles.link}>
                        <FaLinkedin size={14} />
                    </a>
                </div>
                
                <p style={styles.text}> &copy; {new Date().getFullYear()} A.H. All rights reserved. </p>
            </Container>
        </footer>
    );
};

export default Footer;