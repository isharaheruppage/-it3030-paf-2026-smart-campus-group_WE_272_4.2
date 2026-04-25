import axios from 'axios';

export const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8082';
const API_BASE_URL = `${SERVER_BASE_URL}/api/bookings`;

// Shared axios instance — same pattern as ticketApi.js
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Attach Basic auth (same as ticketApi)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || '1';
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        config.headers.Authorization = `Basic ${btoa('admin:admin')}`;
    }
    config.headers['User-Id'] = userId;
    console.log('Booking API Request:', config.method?.toUpperCase(), config.url);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('Booking API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('Booking API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const getAllBookings = async () => {
    const response = await api.get('/');
    return Array.isArray(response.data) ? response.data : [];
};

export const getBookingById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

export const createBooking = async (bookingData) => {
    const response = await api.post('/', bookingData);
    return response.data;
};

export const updateBooking = async (id, bookingData) => {
    const response = await api.put(`/${id}`, bookingData);
    return response.data;
};

export const deleteBooking = async (id) => {
    await api.delete(`/${id}`);
};

export const updateBookingStatus = async (id, status, rejectionReason = '') => {
    const response = await api.patch(`/${id}/status`, { status, rejectionReason });
    return response.data;
};

export default api;
