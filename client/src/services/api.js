import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
    return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Prescriptions
export const getPrescriptions = () => api.get('/prescriptions');
export const addPrescription = (data) => api.post('/prescriptions', data);
export const updatePrescription = (id, data) => api.put(`/prescriptions/${id}`, data);
export const deletePrescription = (id) => api.delete(`/prescriptions/${id}`);

// Appointments
export const getAppointments = () => api.get('/appointments');
export const addAppointment = (data) => api.post('/appointments', data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// Symptoms
export const getSymptoms = () => api.get('/symptoms');
export const addSymptom = (data) => api.post('/symptoms', data);
export const updateSymptom = (id, data) => api.put(`/symptoms/${id}`, data);
export const deleteSymptom = (id) => api.delete(`/symptoms/${id}`);

// Interactions
export const checkInteractions = () => api.get('/interactions/check-all');

// Medicines
export const getMedicines = () => api.get('/medicines');
export const addMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
export const toggleMedicineStatus = (id) => api.patch(`/medicines/${id}/toggle`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export default api;