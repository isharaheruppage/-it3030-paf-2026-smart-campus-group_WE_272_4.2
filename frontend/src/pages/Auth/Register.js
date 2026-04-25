import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post(`${API_URL}/register`, formData);
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logo}>🏫</div>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Join Smart Campus Operations Hub</p>

                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Role</label>
                        <select
                            style={styles.input}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="USER">User (Student / Staff)</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TECHNICIAN">Technician</option>
                        </select>
                    </div>
                    <button type="submit" style={loading ? styles.buttonDisabled : styles.button} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={styles.loginLink}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif",
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    },
    logo: { fontSize: '48px', textAlign: 'center', marginBottom: '10px' },
    title: { color: '#fff', textAlign: 'center', margin: '0 0 8px', fontSize: '26px', fontWeight: 700 },
    subtitle: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500 },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    button: {
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '8px',
    },
    buttonDisabled: {
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: '#555',
        color: '#aaa',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'not-allowed',
        marginTop: '8px',
    },
    errorBox: {
        background: 'rgba(255,80,80,0.15)',
        border: '1px solid rgba(255,80,80,0.4)',
        color: '#ff8080',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '13px',
        marginBottom: '8px',
    },
    successBox: {
        background: 'rgba(80,255,120,0.15)',
        border: '1px solid rgba(80,255,120,0.4)',
        color: '#80ffaa',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '13px',
        marginBottom: '8px',
    },
    loginLink: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '20px', fontSize: '13px' },
    link: { color: '#667eea', textDecoration: 'none', fontWeight: 600 },
};
