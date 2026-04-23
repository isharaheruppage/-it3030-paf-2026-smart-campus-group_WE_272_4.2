import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logoWrap}>
                    <span style={styles.logoIcon}>🏫</span>
                </div>
                <h1 style={styles.title}>Smart Campus Hub</h1>
                <p style={styles.subtitle}>Sign in to access your campus portal</p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
                        {loading ? 'Signing in...' : '🔑 Sign In'}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>or</span>
                    <div style={styles.dividerLine} />
                </div>

                <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '10px', flexShrink: 0 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                </button>

                <div style={styles.hint}>
                    <p style={styles.hintText}>
                        💡 <strong>Demo account:</strong> test@test.com / password123
                    </p>
                </div>

                <p style={styles.footer}>Smart Campus Operations Hub &copy; 2026</p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        textAlign: 'center',
    },
    logoWrap: {
        width: '72px',
        height: '72px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
    },
    logoIcon: { fontSize: '36px' },
    title: { color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.5px' },
    subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 28px' },
    errorBox: {
        background: 'rgba(255,80,80,0.12)',
        border: '1px solid rgba(255,80,80,0.3)',
        color: '#ff8080',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '13px',
        marginBottom: '16px',
        textAlign: 'left',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500 },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.07)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    btn: {
        padding: '13px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '4px',
        boxShadow: '0 4px 16px rgba(102,126,234,0.35)',
    },
    btnDisabled: {
        padding: '13px',
        borderRadius: '10px',
        border: 'none',
        background: '#555',
        color: '#aaa',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'not-allowed',
        marginTop: '4px',
    },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
    dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
    dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: '12px' },
    googleBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '13px 20px',
        background: '#fff',
        color: '#333',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    },
    hint: {
        marginTop: '20px',
        background: 'rgba(102,126,234,0.1)',
        border: '1px solid rgba(102,126,234,0.2)',
        borderRadius: '10px',
        padding: '10px 14px',
    },
    hintText: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 },
    footer: { color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '24px' },
};

export default Login;
