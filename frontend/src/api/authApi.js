import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/auth`;

export const loginUser = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const generateOtp = async (email) => {
    const response = await axios.post(`${API_URL}/generate-otp?email=${encodeURIComponent(email)}`);
    return response.data;
};

export const verifyOtp = async (email, otpCode) => {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otpCode });
    return response.data;
};
