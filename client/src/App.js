import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import PrescriptionList from './components/PrescriptionList';
import PrescriptionUpload from './components/PrescriptionUpload';
import PrescriptionView from './components/PrescriptionView';
import PrescriptionEdit from './components/PrescriptionEdit';
import AppointmentManager from './components/AppointmentManager';
import AppointmentView from './components/AppointmentView';
import AppointmentEdit from './components/AppointmentEdit';
import SymptomJournal from './components/SymptomJournal';
import SymptomView from './components/SymptomView';
import SymptomEdit from './components/SymptomEdit';
import MedicinesManager from './components/MedicinesManager';
import MissedDoses from './components/MissedDoses';
import Notifications from './components/Notifications';
import PatientProfile from './components/PatientProfile';
import Login from './components/Login';
import Register from './components/Register';
import MissedAppointments from './components/MissedAppointments';
import CaregiverSetup from './components/CaregiverSetup';
import DailySummaryView from './components/DailySummaryView';
import CaregiverDashboard from './components/CaregiverDashboard';
import CaregiverProfile from './components/CaregiverProfile';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for storage changes (when token is saved/removed)
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (token) {
            fetchUserRole();
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
            // If token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const appStyles = {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
    };

    const contentStyles = {
        flex: 1
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div style={appStyles}>
                <Navbar />
                <div style={contentStyles}>
                    <div className="container mt-4">
                        <Routes>
                            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                            <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
                            <Route path="/" element={token ? (userRole === 'caregiver' ? <CaregiverDashboard /> : <Dashboard />) : <Navigate to="/login" />} />
                            <Route path="/prescriptions" element={token ? <PrescriptionList /> : <Navigate to="/login" />} />
                            <Route path="/prescriptions/:id" element={token ? <PrescriptionView /> : <Navigate to="/login" />} />
                            <Route path="/edit_prescription/:id" element={token ? <PrescriptionEdit /> : <Navigate to="/login" />} />
                            <Route path="/add_prescription" element={token ? <PrescriptionUpload /> : <Navigate to="/login" />} />
                            <Route path="/appointments" element={token ? <AppointmentManager /> : <Navigate to="/login" />} />
                            <Route path="/appointments/:id" element={token ? <AppointmentView /> : <Navigate to="/login" />} />
                            <Route path="/edit_appointment/:id" element={token ? <AppointmentEdit /> : <Navigate to="/login" />} />
                            <Route path="/symptoms" element={token ? <SymptomJournal /> : <Navigate to="/login" />} />
                            <Route path="/symptoms/:id" element={token ? <SymptomView /> : <Navigate to="/login" />} />
                            <Route path="/edit_symptom/:id" element={token ? <SymptomEdit /> : <Navigate to="/login" />} />
                            <Route path="/medicines" element={token ? <MedicinesManager /> : <Navigate to="/login" />} />
                            <Route path="/missed-doses" element={token ? <MissedDoses /> : <Navigate to="/login" />} />
                            <Route path="/missed-appointments" element={token ? <MissedAppointments /> : <Navigate to="/login" />} />
                            <Route path="/notifications" element={token ? <Notifications /> : <Navigate to="/login" />} />
                            <Route path="/profile" element={token ? (userRole === 'caregiver' ? <CaregiverProfile /> : <PatientProfile />) : <Navigate to="/login" />} />
                            <Route path="/caregiver" element={token ? <CaregiverSetup /> : <Navigate to="/login" />} />
                            <Route path="/daily-summary" element={token ? <DailySummaryView /> : <Navigate to="/login" />} />
                            <Route path="/caregiver-profile" element={token && userRole === 'caregiver' ? <CaregiverProfile /> : <Navigate to="/login" />} />
                        </Routes>
                    </div>
                </div>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;